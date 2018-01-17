import { BasePermissions } from "sp-pnp-js/lib/pnp";

interface IPromotedLinkDataSource {
  Id: string;
  Url: string;
  Title: string;
  Description?: string;
  Order: number;
  EffectiveBasePermissions: BasePermissions;
}

export default IPromotedLinkDataSource;