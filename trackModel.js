const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//strings only!
const trackModel = new Schema(
{
    title: { type: String, required: true },
    artist: { type: String, required: true },
    genre: { type: String, required: true },
    release: { type: String, required: true },
    duration: { type: String, required: true }
}
);

module.exports = mongoose.model ('Track', trackModel);
