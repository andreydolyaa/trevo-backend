const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    getById,
    getByEmail,
    remove,
    update,
    add,
    signup,
    login
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('user')
    try {
        const users = await collection.find().toArray();
        users.forEach(user => delete user.password);

        return users
    } catch (err) {
        console.log('ERROR: cannot find users')
        throw err;
    }
}

async function getById(userId) {
    const collection = await dbService.getCollection('user')
    try {
        const user = await collection.findOne({ '_id': ObjectId(userId) })
        delete user.password

        return user
    } catch (err) {
        console.log(`ERROR: while finding user ${userId}`)
        throw err;
    }
}
async function getByEmail(email) {
    const collection = await dbService.getCollection('user')
    try {
        const user = await collection.findOne({ email })
        return user
    } catch (err) {
        console.log(`ERROR: while finding user ${email}`)
        throw err;
    }
}

async function remove(userId) {
    const collection = await dbService.getCollection('user')
    try {
        await collection.deleteOne({ '_id': ObjectId(userId) })
    } catch (err) {
        console.log(`ERROR: cannot remove user ${userId}`)
        throw err;
    }
}

async function update(user) {
    const collection = await dbService.getCollection('user')
    user._id = ObjectId(user._id);

    try {
        await collection.updateOne({ _id: user._id }, { $set: user })
        return user
    } catch (err) {
        console.log(`ERROR: cannot update user ${user._id}`)
        throw err;
    }
}

async function add(user) {
    const collection = await dbService.getCollection('user')
    try {
        await collection.insertOne(user);
        return user;
    } catch (err) {
        console.log(`ERROR: cannot insert user`)
        throw err;
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};
    return criteria;
}

async function signup(userdata) {
    if (!userdata.email || !userdata.password || !userdata.fullName) return Promise.reject('Email & Password required');
    return add(userdata);
}

async function login(email, password) {
    if (!email || !password) throw new Error('Email and password Required!');
    const user = await getByEmail(email);
    if (!user) return Promise.reject('Invaild Email or Password');
    if (user.email !== email) return console.log('Invaild Email or Password');
    if (user.password !== password) return {error:'Wrong password!'}
    else {
        delete user.password;
        return user;
    }
}