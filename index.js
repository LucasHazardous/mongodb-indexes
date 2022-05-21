const mongo = require("mongodb");

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ttl_index() {
    const client = new mongo.MongoClient("mongodb://127.0.0.1:27017");
    await client.connect();

    const db = await client.db("index_test");


    try {
        await db.createCollection("sessions", {
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

    await db.collection("sessions").deleteMany({});

    await db.collection("sessions").createIndex({
        "creation_date": 1
    }, {
        expireAfterSeconds: 10
    });

    await db.collection("sessions").insertOne({
        "token": "a",
        "creation_date": new Date()
    });

    console.log(await db.collection("sessions").find({}).toArray());

    await timeout(60000);

    console.log(await db.collection("sessions").find({}).toArray());
    console.log(new Date());

    await client.close();
}

ttl_index().catch(err => console.log(err));