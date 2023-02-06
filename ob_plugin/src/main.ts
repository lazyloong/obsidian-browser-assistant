import {
    App,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    WorkspaceLeaf,
} from "obsidian";
import http from "http";

const HOSTNAME = "127.0.0.1";

type UsedPlugin = "Omnisearch" | "全局搜索";
interface Browser_assistant_Settings {
    showNotice: boolean;
    showData: boolean;
    port: number;
    usedPlugin: UsedPlugin;
    maxNum: number;
}

const DEFAULT_SETTINGS: Browser_assistant_Settings = {
    showData: true,
    showNotice: false,
    port: 27125,
    usedPlugin: "Omnisearch",
    maxNum: 15,
};

export default class Browser_assistant extends Plugin {
    server: Server;
    settings: Browser_assistant_Settings;
    async onload() {
        await this.loadSettings();
        switch (this.settings.usedPlugin) {
            case "Omnisearch":
                if (!app.plugins.plugins.omnisearch) {
                    new Notice("未检测到 Omnisearch 插件");
                    return;
                }
                break;
            case "全局搜索":
                if (!app.internalPlugins.plugins["global-search"].enabled) {
                    new Notice("未检测到全局搜索插件");
                    return;
                }
                break;
        }
        this.server = new Server(
            this.settings.port,
            this,
            this.settings.usedPlugin
        );
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }
    onunload() {
        this.server.close();
    }
    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: Browser_assistant;
    constructor(app: App, plugin: Browser_assistant) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display(): void {
        let { containerEl } = this;
        containerEl.empty();
        new Setting(containerEl)
            .setName("监听端口")
            .setDesc("默认为 27125")
            .addText((text) =>
                text
                    .setPlaceholder("Port")
                    .setValue(this.plugin.settings.port.toString())
                    .onChange(async (value) => {
                        this.plugin.settings.port = Number(value);
                        this.plugin.server.switchPort(Number(value));
                        await this.plugin.saveSettings();
                    })
            );
        new Setting(containerEl)
            .setName("显示 Notice")
            .setDesc("服务运行成功时显示 Notice")
            .addToggle((text) =>
                text
                    .setValue(this.plugin.settings.showNotice)
                    .onChange(async (value) => {
                        this.plugin.settings.showNotice = value;
                        await this.plugin.saveSettings();
                    })
            );
        new Setting(containerEl)
            .setName("控制台显示数据")
            .setDesc("打开时在控制台里显示通信数据")
            .addToggle((text) =>
                text
                    .setValue(this.plugin.settings.showData)
                    .onChange(async (value) => {
                        this.plugin.settings.showNotice = value;
                        await this.plugin.saveSettings();
                    })
            );
        new Setting(containerEl)
            .setName("搜索使用的插件")
            .setDesc("默认 Omnisearch")
            .addDropdown((text) =>
                text
                    .addOptions({
                        Omnisearch: "Omnisearch",
                        全局搜索: "全局搜索",
                    })
                    .setValue(this.plugin.settings.usedPlugin)
                    .onChange(async (value: UsedPlugin) => {
                        this.plugin.settings.usedPlugin = value;
                        this.plugin.server.switchUsedPlugin(value);
                        await this.plugin.saveSettings();
                    })
            );
        new Setting(containerEl)
            .setName("全局搜索最大数量")
            .setDesc("默认为 15")
            .addSlider((text) =>
                text
                    .setLimits(1, 30, 1)
                    .setDynamicTooltip()
                    .setValue(this.plugin.settings.maxNum)
                    .onChange(async (value) => {
                        this.plugin.settings.maxNum = value;
                        this.plugin.server.switchUsedPlugin(value);
                        await this.plugin.saveSettings();
                    })
            );
    }
}

class Server {
    port: number;
    server: http.Server;
    plugin: Browser_assistant;
    used_plugin: UsedPlugin;
    search: any;
    constructor(
        port: number,
        plugin: Browser_assistant,
        used_plugin: UsedPlugin
    ) {
        this.plugin = plugin;
        this.port = port;
        this.switchUsedPlugin(used_plugin);
        this.init();
        // this.search = app.plugins.plugins.omnisearch.api.search;
    }
    init() {
        this.server = http.createServer((request, response) => {
            let data = "";
            request.on("data", (chunk) => {
                data += chunk;
            });
            request.on("end", async () => {
                if (!data) return;
                let str = { ...JSON.parse(data) };

                let query = decodeURIComponent(
                        str["query"].replace(/\+/g, " ")
                    ),
                    result = await this.search(query),
                    title = app.title.split(" - ")[0];
                result = result.map((p) => {
                    return { ...p, vault: title };
                });

                if (this.plugin.settings.showData) console.log(query, result);

                response.setHeader("content-type", "application/json");
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.end(JSON.stringify(result));
            });
        });
        this.server.listen(this.port, HOSTNAME);

        console.log(
            `Browser assistant listening on http://${HOSTNAME}:${this.port}/`
        );
        if (this.plugin.settings.showNotice)
            new Notice("Browser assistant 服务运行成功", 5000);
    }

    // search(query: string) {
    //     console.log(this.used_plugin);
    //     switch (this.used_plugin) {
    //         case "Omnisearch":
    //             let s = app.plugins.plugins.omnisearch.api.search;
    //             return s(query);
    //         case "全局搜索":
    //             return this.searchWithGlobalSearch(query);
    //     }
    // }

    async searchWithGlobalSearch(query: string) {
        let _a: WorkspaceLeaf;
        const searchView =
            (_a = app.workspace.getLeavesOfType("search")[0]) === null ||
            _a === void 0
                ? void 0
                : _a.view;
        searchView.setQuery(query);
        let state = searchView.getState();

        let resultDOM = searchView.dom;
        let resultNum = -1;
        let plugin = this.plugin;
        let wait = async function () {
            if (
                resultNum == resultDOM.resultDomLookup.size ||
                resultDOM.resultDomLookup.size >= plugin.settings.maxNum
            ) {
                return;
            } else {
                resultNum = resultDOM.resultDomLookup.size;
                await new Promise<void>(function (resolve, reject) {
                    setTimeout(function () {
                        wait();
                        resolve();
                    }, 1000);
                });
            }
        };
        await wait();

        let searchQuery = searchView.searchQuery.matcher.matchers
            ? searchView.searchQuery.matcher.matchers.map((p) => p.text)
            : searchView.searchQuery.matcher.text;
        let resultMap = Array.from(resultDOM.resultDomLookup.values());
        let result = [];

        for (const i of resultMap) {
            let c = i.result.content[0],
                p = app.metadataCache.getFileCache(i.file),
                d = p.listItems,
                f = p.sections,
                pos,
                t;

            if (state.extraContext)
                pos = i.getMatchExtraPositions(i.content, c, d, f);
            else pos = i.getMatchMinimalPositions(i.content, c);
            t = i.content.substr(pos[0], pos[1] - pos[0]);
            let data = {
                basename: i.file.basename,
                path: i.file.path,
                foundWords: searchQuery,
                excerpt: t,
            };
            result.push(data);
            if (result.length >= this.plugin.settings.maxNum) break;
        }

        searchView.setQuery("");
        return result;
    }

    switchPort(port: number) {
        this.port = port;
        this.server.close();
        this.init();
    }

    async switchUsedPlugin(used_plugin: UsedPlugin) {
        this.used_plugin = used_plugin;
        switch (this.used_plugin) {
            case "Omnisearch":
                let s;
                let wait = async function () {
                    if (!app.plugins.plugins.omnisearch.api.search) {
                        await new Promise<void>(function (resolve, reject) {
                            setTimeout(function () {
                                wait();
                                resolve();
                            }, 100);
                        });
                    } else {
                        s = app.plugins.plugins.omnisearch.api.search;
                    }
                };
                await wait();
                this.search = s;
                break;

            case "全局搜索":
                this.search = this.searchWithGlobalSearch;
                break;
        }
    }

    close() {
        this.server.close();
    }
}
