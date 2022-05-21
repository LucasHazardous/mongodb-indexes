const mongo = require("mongodb");
const sessionsCollectionName = "sessions";

async function ttl_index() {
    const client = new mongo.MongoClient("mongodb://127.0.0.1:27017");
    await client.connect();

    const db = await client.db("index_test");

    await createNewSessionCollectionIfPossible(db, sessionsCollectionName);

    await createTTLIndex(db, sessionsCollectionName);

    await insertOneDocument(db, sessionsCollectionName);

    await showAllDataInCollection(db, sessionsCollectionName);

    await timeout(60000);

    await showAllDataInCollection(db, sessionsCollectionName);
    console.log(new Date());

    await client.close();
}

async function showAllDataInCollection(db, collection) {
    console.log(await db.collection(collection).find({}).toArray());
}

async function createNewSessionCollectionIfPossible(db, collection) {
    try {
        await db.createCollection(collection, {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["token", "creation_date"],
                    properties: {
                        token: {
                            bsonType: "string"
                        },
                        creation_date: {
                            bsonType: "date"
                        }
                    }
                },
            }
        });
    } catch (error) {
        console.log("collection exists");
    }
}

async function createTTLIndex(db, collection) {
    await db.collection(collection).createIndex({
        "creation_date": 1
    }, {
        expireAfterSeconds: 10
    });
}

async function insertOneDocument(db, collection) {
    await db.collection(collection).insertOne({
        "token": "a",
        "creation_date": new Date()
    });
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

ttl_index().catch(err => console.log(err));