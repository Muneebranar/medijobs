import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const uri = 'mongodb+srv://muneebrana:ImCH4ypay7GjpG3x@cluster0.kzsebd3.mongodb.net/medijobs?retryWrites=true&w=majority&appName=Cluster0';

async function checkDatabase() {
  console.log('Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
    console.log('CONNECTED! Host:', mongoose.connection.host);
    console.log('Database Name:', mongoose.connection.name);
    console.log('ReadyState:', mongoose.connection.readyState);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n--- COLLECTIONS FOUND ---');
    for (const c of collections) {
      const coll = db.collection(c.name);
      const count = await coll.countDocuments();
      console.log(`Collection: "${c.name}" -> ${count} items`);
      const docs = await coll.find().limit(10).toArray();
      console.log(`  Items in "${c.name}":`, docs.map(d => ({
        id: d.id || d._id,
        title: d.title,
        name: d.name,
        fullName: d.fullName,
        email: d.email,
        jobTitle: d.jobTitle,
        hospital: d.hospital
      })));
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected cleanly.');
  }
}

checkDatabase();
