import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import http from "http";

const HOSTNAME = "127.0.0.1";

interface Browser_assistant_Settings {
    showNotice: boolean;
    showData: boolean;
    port: number;
}

const DEFAULT_SETTINGS: Browser_assistant_Settings = {
    showData: true,
    showNotice: false,
    port: 27125,
};

export default class Browser_assistant extends Plugin {
    server: Server;
    settings: Browser_assistant_Settings;
    async onload() {
        if (!app.plugins.plugins.omnisearch) {
            new Notice("未检测到 Omnisearch 插件");
            return;
        }
        await this.loadSettings();

        this.addSettingTab(new SampleSettingTab(this.app, this));

        let timer = setInterval(() => {
            let search = app.plugins.plugins?.omnisearch?.api?.search;
            if (search) {
                this.server = new Server(this.settings.port, this);
                clearInterval(timer);
            }
        }, 1000);
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
    }
}

class Server {
    port: number;
    server: http.Server;
    search: any;
    plugin: Browser_assistant;
    constructor(port: number, plugin: Browser_assistant) {
        this.plugin = plugin;
        this.port = port;
        this.init();
        this.search = app.plugins.plugins.omnisearch.api.search;
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

    switchPort(port: number) {
        this.port = port;
        this.server.close();
        this.init();
    }

    close() {
        this.server.close();
    }
}
