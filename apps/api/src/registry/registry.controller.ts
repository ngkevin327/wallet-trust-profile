import { Controller, Get, Headers, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { RegistryService } from "./registry.service";

@ApiTags("registry")
@Controller("internal/registry")
export class RegistryController {
  constructor(private readonly registry: RegistryService) {}

  private assertStagingAccess(apiKey: string | undefined) {
    const expected = process.env.ADMIN_API_KEY;
    if (!expected || process.env.NODE_ENV === "production") {
      throw new NotFoundException();
    }
    if (!apiKey || apiKey !== expected) {
      throw new UnauthorizedException("Invalid admin API key");
    }
  }

  @Get()
  @ApiOperation({ summary: "Registry debug snapshot (staging only)" })
  async debugSnapshot(@Headers("x-admin-api-key") apiKey?: string) {
    this.assertStagingAccess(apiKey);
    const [protocols, daos] = await Promise.all([
      this.registry.getProtocols(),
      this.registry.getDaos(),
    ]);
    return {
      protocolCount: protocols.length,
      daoCount: daos.length,
      protocols: protocols.map((p) => ({
        slug: p.slug,
        chainId: p.chainId,
        contract: p.contract,
        category: p.category,
      })),
      daos: daos.map((d) => ({
        slug: d.slug,
        chainId: d.chainId,
        treasury: d.treasury,
      })),
    };
  }
}
