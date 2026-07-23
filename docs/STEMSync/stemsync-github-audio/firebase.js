// firebase stuff here
// keep this file in Google Drive > STEMSync

async function writeUser(userId, username, email) {
  await fdb_set(fdb_ref(myfdb, `users/${userId}`), {
    username,
    email,
    createdAt: Date.now()
  });
  console.log('User written:', userId);
}