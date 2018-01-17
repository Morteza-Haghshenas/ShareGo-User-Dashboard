import pnp, { PermissionKind } from "sp-pnp-js";
import IPromotedLinkDataSource from '../models/IPromotedLinkDataSource';

export default class PermissionManager {
  public static hasPermission(dataSource: IPromotedLinkDataSource, permission: PermissionKind) : boolean {
    let basePermissions = dataSource.EffectiveBasePermissions;
    return pnp.sp.web.lists.getById(dataSource.Id).hasPermissions(basePermissions, permission);
  }
}