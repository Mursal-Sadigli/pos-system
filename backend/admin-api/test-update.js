require('ts-node').register();
const { StoreModel } = require('./src/models/Store.model.ts');
const { connectDB } = require('./src/config/database');

async function test() {
  await connectDB();
  try {
    const res = await StoreModel.findAll({limit: 1});
    const storeId = res.stores[0].id;
    console.log("Updating store", storeId);
    await StoreModel.update(storeId, { role_permissions: {"MANAGER":["sales_view","inventory_manage","store_settings"],"CASHIER":["pos_access","sales_view_own"],"VIEWER":["sales_view","inventory_view"]} });
    console.log("Update success!");
  } catch(e) {
    console.error("Update failed:", e);
  }
  process.exit(0);
}
test();
