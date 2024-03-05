import EdgeLoader from "./edge";

GM_registerMenuCommand("切换端口", function () {
    let port = GM_getValue("ba_port");
    if (!port) {
        port = 51361;
    }
    port = window.prompt("设置可用端口", port);
    GM_setValue("ba_port", port);
});

const url = window.location.href;
const loaders = {
    edge: new EdgeLoader(),
};
let loader;
for (let key in loaders) {
    if (loaders[key].test(url)) {
        loader = loaders[key];
        break;
    }
}
let port = GM_getValue("ba_port") ?? "51361";
loader.load(url, port);
