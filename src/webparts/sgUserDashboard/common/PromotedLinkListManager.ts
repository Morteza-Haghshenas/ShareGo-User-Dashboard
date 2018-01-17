import pnp, { Web, List, ListEnsureResult, ListAddResult } from "sp-pnp-js";
import IPromotedLinkList from '../models/IPromotedLinkList';

export default class PromotedLinkListManager {

  constructor() {
  }

  public getAllPromotedLinkLists() : Promise<IPromotedLinkList[]> {
    return new Promise<IPromotedLinkList[]>((resolve, reject) => {
      const lists: IPromotedLinkList[] = [];
      pnp.sp.web.lists.select("Id", "Title", "Description").filter("BaseTemplate eq 170").get().then((result) => {                
        console.log("Found", result.length, "promoted link lists in web");
        for (var i = 0; i < result.length; i++) {
          lists.push({
            Id: result[i].Id,
            Title: result[i].Title,
            Description: result[i].Description,
            Url: null,
            EffectiveBasePermissions: null
          });
        }        
      }).then(() => {
        const promises: Promise<any>[] = [];
        lists.forEach((list, index) => {
          promises.push(pnp.sp.web.lists.getById(list.Id).rootFolder.serverRelativeUrl.get().then(listUrl => {
            lists[index].Url = listUrl;
          }));
          promises.push(pnp.sp.web.lists.getById(list.Id).effectiveBasePermissions.get().then(permissions => {
            lists[index].EffectiveBasePermissions = permissions;
          }));
        });
        Promise.all(promises).then(() => {
          resolve(lists);
        });
      }).catch(e => {
          console.log(e);
          resolve(lists);
      });
    });
  }

  public createPromotedLinkList(listTitle: string, description?: string) : Promise<IPromotedLinkList> {
    return new Promise<IPromotedLinkList>((resolve, reject) => {
      let list: IPromotedLinkList = null;
      pnp.sp.web.lists.add(listTitle, description, 170, false, { "TemplateFeatureId": "192EFA95-E50C-475e-87AB-361CEDE5DD7F" }).then((listAddResult) => {
        listAddResult.list.select("Id", "Title", "Description").get().then((result) => {
          list = {
            Id: result.Id,
            Title: result.Title,
            Description: result.Description,
            Url: null,
            EffectiveBasePermissions: null
          };
        }).then(() => {
          pnp.sp.web.lists.getById(list.Id).rootFolder.serverRelativeUrl.get().then(listUrl => {
            list.Url = listUrl;
          }).then(() => {
            pnp.sp.web.lists.getById(list.Id).effectiveBasePermissions.get().then(permissions => {
              list.EffectiveBasePermissions = permissions;
              resolve(list);
            });
          });
        });
      }).catch(e => reject(e));
    });
  }

  public ensurePromotedLinkList(webUrl: string, listTitle: string) : Promise<List> {
    return new Promise<List>((resolve, reject) => {
      let web = new Web(webUrl);
      pnp.sp.

      // use lists.ensure to always have the list available
      web.lists.ensure(listTitle).then((ler: ListEnsureResult) => {
        if (ler.created) {
          // we created the list on this call so let's add a column
          // ler.list.fields.addText("OrderNumber").then(_ => {

          // }).catch(e => reject(e));

        } else {
          resolve(ler.list);
        }
      }).catch(e => reject(e));
    });
  }
}