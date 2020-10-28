const {createCanvas, loadImage} = require('canvas');
const fs = require('fs');

const cache = '.cache';

module.exports = async function imageLoader([userId, profileUrl]) {
    if (!fs.existsSync(cache)) {
        fs.mkdirSync(cache);
    }
    try {
        const img = await loadImage(`${cache}/${userId}.png`);
        return img;
    } catch (e) {
        const defaultAvatarUrl =
            "https://abs.twimg.com/sticky/default_profile_images/default_profile_200x200.png";
        const url = profileUrl || defaultAvatarUrl;
        const img = await loadImage(url);
        try {
            const canvas = createCanvas(400, 400);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(
                img,
                0,
                0,
                400,
                400
            );
            const out = fs.createWriteStream(`${cache}/${userId}.png`);
            const stream = canvas.createPNGStream();
            stream.pipe(out);
        } catch (e) {
            //nothing
        }
        return img;
    }
}