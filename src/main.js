import BingLoader from "./bing";
import GoogleLoader from "./google";

GM_registerMenuCommand("切换端口", function () {
    let port = GM_getValue("ba_port");
    if (!port) {
        port = 51361;
    }
    port = window.prompt("设置可用端口", port);
    GM_setValue("ba_port", port);
});

const url = window.location.href;
const loaders = [new BingLoader(), new GoogleLoader()];

let loader = loaders.find((loader) => loader.test(url));
let port = GM_getValue("ba_port") ?? "51361";
loader.load(url, port);
