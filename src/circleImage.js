const {createCanvas, loadImage} = require('canvas');
const fs = require('fs');
const ConsoleProgressBar = require('console-progress-bar')

const toRad = (x) => x * (Math.PI / 180);


module.exports = async function render(followers) {
    //configs
    const circlesRadius = 100;
    const imageRadius = 50;
    const padding = 100;
    const offset_conf = 0;


    let layers = [1];
    let count = 1;

    while (count < followers.length) {
        let c = Math.floor(layers.length * circlesRadius * 3.14 / imageRadius);
        layers.push(c);
        count += c;
    }

    const width = 2 * layers.length * circlesRadius + padding;
    const height = 2 * layers.length * circlesRadius + padding;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // fill the background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    console.log('Fetching images')
    const cpb = new ConsoleProgressBar({maxValue: followers.length})
    let counter = 0;
    // loop over the layers
    for (let count of layers) {
        let layerIndex = layers.indexOf(count);
        count = Math.min(count, followers.length - counter);
        const angleSize = 360 / count;


        // loop over each circle of the layer
        for (let i = 0; i < count; i++) {
            // We need an offset or the first circle will always on the same line and it looks weird
            // Try removing this to see what happens
            const offset = layerIndex * offset_conf;

            // i * angleSize is the angle at which our circle goes
            // We need to converting to radiant to work with the cos/sin
            const r = toRad(i * angleSize + offset);

            const centerX = Math.cos(r) * layerIndex * circlesRadius + width / 2;
            const centerY = Math.sin(r) * layerIndex * circlesRadius + height / 2;

            // if we are trying to render a circle but we ran out of users, just exit the loop. We are done.
            if (counter === followers.length) break;

            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, imageRadius - 2, 0, 2 * Math.PI);
            ctx.clip();

            const defaultAvatarUrl =
                "https://abs.twimg.com/sticky/default_profile_images/default_profile_200x200.png";
            const avatarUrl = followers[counter++][1] || defaultAvatarUrl;
            cpb.addValue(1);

            const img = await loadImage(avatarUrl);
            ctx.drawImage(
                img,
                centerX - imageRadius,
                centerY - imageRadius,
                imageRadius * 2,
                imageRadius * 2
            );

            ctx.restore();
        }
    }

    // write the resulting canvas to file
    const out = fs.createWriteStream("./circle.png");
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => console.log("Done!"));
};
