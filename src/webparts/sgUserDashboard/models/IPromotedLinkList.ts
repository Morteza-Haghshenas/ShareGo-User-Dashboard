import { BasePermissions } from "sp-pnp-js/lib/pnp";

interface IPromotedLinkList {
  Id: string;
  Title: string;
  Description: string;
  Url: string;
  EffectiveBasePermissions: BasePermissions;
}

export default IPromotedLinkList;