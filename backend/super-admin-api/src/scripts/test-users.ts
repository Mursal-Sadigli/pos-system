import { UserModel } from '../models/User.mode';
import { connectDB } from '../config/database';

async function test() {
  await connectDB();
  const res = await UserModel.findAll({});
  console.log("Users total:", res.pagination.total);
  res.users.forEach((u: any) => {
    console.log(`- ${u.name} (${u.email}) [Role: ${u.role}] [Status: ${u.status}] [Store: ${u.store_name}]`);
  });
  process.exit(0);
}

test().catch(console.error);
