<template>
    <div class="card">
        <Dialog v-model:visible="visible_change_location" modal header="设置新目录" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-8">将 {{ selectedTorrents.length }}
                个种子转移到 </span>
            <div class="flex items-center gap-4 mb-8">
                <span class="font-semibold w-24">新目录</span>
                <Select v-model="new_path" editable :options="dirs" optionLabel="name" placeholder="选一个目录"
                    class="w-full md:w-56" />
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="取消" severity="secondary" @click="visible_change_location = false"></Button>
                <Button type="button" label="确定" @click="visible_change_location = false"></Button>
            </div>
        </Dialog>

        <Dialog v-model:visible="visible_delete" modal header="删除种子" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-8">即将删除{{ selectedTorrents.length }}
                个种子</span>
            <div class="flex items-center gap-4 mb-8">
                <Checkbox v-model="delete_local_files" :binary="true" /> <span>同时删除本地数据</span>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="取消" severity="secondary" @click="visible_delete = false"></Button>
                <Button type="button" label="确定" @click="visible_delete = false"></Button>
            </div>
        </Dialog>
        <Toast />

        selected torrents: {{ selectedTorrents.map(item => item.id) }}
        <i icon="pi pi-angle-double-up"></i>上传速度 {{ upload_rate }}
        <i icon="pi pi-angle-double-up">总做种量 {{ total_size }}</i>
        Transmission 版本: {{ tr_ver }}
        <button type="button" class="layout-topbar-action" @click="toggleLimit">
            <i :class="'fa-solid', isLimited ? 'fa-person-walking-with-cane' : 'fa-person-running'"></i>
        </button>
        <button type="button" class="layout-topbar-action" @click="isLimited.value = false">
            <!-- <i class="pi pi-moon"></i>
            <i class="fa-light fa-chevron-down"></i> -->
            <font-awesome-icon :icon="['fas', 'person-running']" />
        </button>
        <button type="button" class="layout-topbar-action" @click="isLimited.value = !isLimited.value">
            <i :class="['pi', { 'pi-moon': isLimited, 'pi-sun': !isLimited }]"></i>
        </button>

        <DataTable :value="torrents" :paginator="true" :rows="20" dataKey="id" :rowHover="true"
            v-model:selection="selectedTorrents" v-model:filters="filters" selectionMode="multiple" sortMode="multiple"
            size="small" filterDisplay="menu" :loading="loading1" :globalFilterFields="['name', 'downloadDir']"
            v-model:expandedRows="expandedRows">
            <!-- :filters="filters" -->

            <template #header>
                <div class="flex justify-between">
                    <Button v-for="b in buttons" :icon="b.icon" :severity="b.severity" text rounded :aria-label="b.label"
                        @click="handleClick(b.event)" />
                    <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" />
                    <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                    <Button text icon="pi pi-tag" label="AddLabel" @click="addLabel" />
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    </IconField>
                </div>
            </template>
            <template #empty> No torrents found. </template>
            <template #loading> Loading customers data. Please wait. </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column expander style="width: 5rem" />
            <Column field="name" header="名称" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <i :class="`pi ${formatStatus(data.status)['icon']}`"
                            :style="`color: ${formatStatus(data.status)['color']}; font-size: 1rem `"></i>
                        <span>{{ data.name }}</span>
                    </div>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" sortable type="text" placeholder="Search by name" />
                </template>
            </Column>
            <Column field="percentDone" header="进度" :showFilterMatchModes="false" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <ProgressBar style="--p-progressbar-label-red" :value="data.percentDone * 100" :showValue="true">
                    </ProgressBar>
                </template>
                <template #filter="{ filterModel }">
                    <Slider v-model="filterModel.value" range class="m-4"></Slider>
                    <div class="flex items-center justify-between px-2">
                        <span>{{ filterModel.value ? filterModel.value[0] : 0 }}</span>
                        <span>{{ filterModel.value ? filterModel.value[1] : 100 }}</span>
                    </div>
                </template>
            </Column>
            <Column field="hashString" header="hash" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.hashString }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" sortable type="text" placeholder="Search by hash" />
                </template>
            </Column>

            <Column field="trackers" header="PT站" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ siteNameToPTname(data.trackers[0].sitename) }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by PT站" />
                </template>
            </Column>
            <Column field="labels" header="标签" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <Tag v-for="t in labelParse(data.labels)" :value="t.name"
                        :style="{ background: t.color_lighten, color: t.color }" />
                    <Button type="button" icon="pi pi-pencil" outlined text @click="toggleLabel($event, data.id)" />
                    <Popover ref="op_label" id="label_select" style="width: 450px">
                        <MultiSelect v-model="selectedTags" :options="tags" optionLabel="name" filter
                            placeholder="Select tags" display="chip" class="w-full md:w-80">
                            <template #option="slotProps">
                                <div class="flex items-center">
                                    <img :alt="slotProps.option.name"
                                        src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png"
                                        :class="`flag flag-${slotProps.option.code.toLowerCase()} mr-2`"
                                        style="width: 18px" />
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                            <template #footer>
                                <div class="py-2 px-4">
                                    <b>{{ selectedTags ? selectedTags.length : 0 }}</b> item{{ (selectedTags ?
                                        selectedTags.length : 0) > 1 ? 's' : '' }} selected.
                                </div>
                            </template>
                        </MultiSelect>
                        <span> name: </span>
                        <span> color: </span>
                    </Popover>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by label" />
                </template>
            </Column>
            <Column field="status" header="状态" sortable :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                <template #body="{ data }">
                    <Tag :value="formatStatus(data.status)['name']" :severity="formatStatus(data.status)['severity']" />
                </template>
                <template #filter="{ filterModel }">
                    <Select v-model="filterModel.value" :options="statuses" placeholder="Select One" showClear>
                        <template #option="slotProps">
                            <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)" />
                        </template>
                    </Select>
                </template>
            </Column>
            <Column field="addedDate" header="完成时间" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ formatTimestamp(data.addedDate) }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by PT站" />
                </template>
            </Column>
            <Column field="peersGettingFromUs" header="下载数" dataType="numeric" sortable style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.peersGettingFromUs }}
                </template>
                <!-- <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" mode="currency" currency="USD" locale="en-US" />
                </template> -->
            </Column>
            <Column field="trackerStats" header="做种数" dataType="numeric" sortable style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.trackerStats[0].seederCount }}
                </template>
                <!-- <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" mode="currency" currency="USD" locale="en-US" />
                </template> -->
            </Column>
            <Column field="activityDate" header="最后活跃时间" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ formatTimestamp(data.activityDate) }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by PT站" />
                </template>
            </Column>
            <Column field="downloadDir" header="路径" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.downloadDir }}
                </template>
                <!-- <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by downloadDir" />
                </template> -->
            </Column>
            <Column field="uploadedEver" header="已上传" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ formatSize(data.uploadedEver, false) }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by 已上传" />
                </template>
            </Column>
            <Column field="uploadRatio" header="分享率" dataType="numeric" sortable style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.uploadRatio }}
                </template>
                <!-- <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" mode="currency" currency="USD" locale="en-US" />
                </template> -->
            </Column>

            <Column field="rateUpload" header="上传速度" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ formatSize(data.rateUpload, true) }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by 上传速度" />
                </template>
            </Column>

            <Column field="totalSize" header="总大小" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ formatSize(data.totalSize, false) }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by name" />
                </template>
            </Column>
            <template #expansion="slotProps">
                <Tabs value="0">
                    <TabList>
                        <Tab v-for="tab in items" :value="tab.value">
                            <i :class="tab.icon" />
                            {{ tab.label }}
                            <!-- <span class="material-icons">rocket_launch</span> -->
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel v-for="pan in items" :value="pan.value">
                            <!-- <component :is="pan.component"></component> -->
                            {{ pan.label }}
                            <FloatingConfigurator />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </template>
        </DataTable>
    </div>
</template>

<script setup>
// import { FileTree } from '@/components/FileTrees.vue';
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { TransmissionRPC } from '@/service/TransmissionRPC';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import Checkbox from 'primevue/checkbox';
import { useToast } from "primevue/usetoast";
import { onBeforeMount, ref } from 'vue';

const toast = useToast();
const items = ref([
    { label: '常规', value: "0", icon: 'pi pi-box', component: null },
    { label: '服务器', value: "1", icon: 'pi pi-server', component: null },
    { label: '文件', value: "2", icon: 'pi pi-folder-open', component: null },
    { label: '用户', value: "3", icon: 'pi pi-user', component: null },
    { label: '设置', value: "4", icon: 'pi pi-cog', component: null },
]);
const dirs = ref([
    { name: '/Downloads/Study', code: 'stu' },
    { name: '/Downloads/Movies', code: 'mov' },
    { name: '/Downloads/Dramas', code: 'dra' },
    { name: '/Downloads/Comics', code: 'com' },
]);
const buttons = ref([
    // {label:'添加种子', icon:'pi pi-plus', severity:''}, //severity决定颜色
    // {label:'全局限速', icon:'pi pi-plus', severity:''},
    { label: '全部开始', icon: 'pi pi-play', severity: 'success', event: 'start' },
    { label: '全部暂停', icon: 'pi pi-pause', severity: 'warn', event: 'pause' },
    { label: '修改文件目录', icon: 'pi pi-file-export', severity: 'info', event: 'changeDir' },
    { label: '删除任务', icon: 'pi pi-trash', severity: 'danger', event: 'delete' },
    { label: '重新校验', icon: 'pi pi-check-circle', severity: 'secondary', event: 'verify' },
]);

const selectedTags = ref();
const tags = ref([
    { name: 'Australia', code: 'AU' },
    { name: 'Brazil', code: 'BR' },
    { name: 'China', code: 'CN' },
    { name: 'Egypt', code: 'EG' },
    { name: 'France', code: 'FR' },
    { name: 'Germany', code: 'DE' },
    { name: 'India', code: 'IN' },
    { name: 'Japan', code: 'JP' },
    { name: 'Spain', code: 'ES' },
    { name: 'United States', code: 'US' }
]);

const visible_change_location = ref(false)
const visible_delete = ref(false)
const delete_local_files = ref(true)
const selectedTorrents = ref([]);
const new_path = ref(null)
const torrents = ref(null);
const total_size = ref(null);
const upload_rate = ref(null);
const tr_ver = ref(null);

const filters = ref(null);
const loading1 = ref(null);
const expandedRows = ref([]);
const isLimited = ref(false)
const op_label = ref(null);
onBeforeMount(async () => {
    TransmissionRPC.setServer()
        .then((response) => {
            // console.log('setServer res', response)
            tr_ver.value = response.version
            console.log('transmission version', tr_ver.value)
            TransmissionRPC.getTorrents()
                .then((res) => {
                    console.log('res', res)
                    torrents.value = res.torrents;
                    upload_rate.value = formatSize(torrents.value.reduce((sum, item) => sum + item.rateUpload, 0), true)
                    total_size.value = formatSize(torrents.value.reduce((sum, item) => sum + item.totalSize, 0))
                    console.log('upload size', upload_rate.value, total_size.value)
                })
                .catch((err) => {
                    console.log('err', err)
                })

        })
        .catch((error) => {
            if (error.message) {
                console.log('setServer, err', error)
            }
        })

    initFilters();
});
const clearFilter = () => {
    initFilters();
};
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        // 'country.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        // representative: { value: null, matchMode: FilterMatchMode.IN },
        // date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
        // balance: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        // status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        // activity: { value: [0, 100], matchMode: FilterMatchMode.BETWEEN },
        // verified: { value: null, matchMode: FilterMatchMode.EQUALS }
    };
};

const expandAll = () => {
    expandedRows.value = torrents.value.reduce((acc, p) => (acc[p.id] = true) && acc, {});
};

const collapseAll = () => {
    expandedRows.value = null;
};

const formatSize = (bytes, speed) => {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    while (bytes >= 1024 && unitIndex < units.length - 1) {
        bytes /= 1024;
        unitIndex++;
    }
    if (speed) {
        return `${bytes.toFixed(2)} ${units[unitIndex]}/s`;
    }
    return `${bytes.toFixed(2)} ${units[unitIndex]}`;
}

const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000); // 转换为毫秒
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const siteNameToPTname = (a) => {
    var site2PT = {
        "hdkylin": "麒麟",
        "hdkyl": "麒麟",
        "rousi": "肉丝",
        "icc2022": "冰淇淋",
        "czhch": "冰淇淋",
        "carpt": "车站",
        "jptv": "JPTV",
        "hamsters": "蝴蝶",
        "m-team": "馒头",
        "piggo": "猪猪",
        "pttime": "PTT",
        "xingtan": "杏坛",
        "gtk": "GTK",
        "nextpt": "飞天拉面",
        "connects": "飞天拉面",
        "crabpt": "蟹黄堡",
        "ubits": "U堡",
        "0ff": "农场",
        "btschool": "学校"
    }
    var pt = site2PT.hasOwnProperty(a) ? site2PT[a] : a;
    return pt
}

const formatStatus = (value) => {
    const statusMap = {
        0: { name: "暂停", severity: "secondary", icon: "pi-pause", color: "#64748B" },// "stopped",
        1: { name: "等待校验", severity: "danger", icon: "pi-hourglass", color: "#158989" },// "queued to verify local data",
        2: { name: "校验中", severity: "warn", icon: "pi-search", color: "#158989" },// "verifying local data",
        3: { name: "等待下载", severity: "constrast", icon: "pi-angle-down", color: "#4169E1" },// "queued to download",
        4: { name: "下载中", severity: "info", icon: "pi-angle-double-down", color: "#4169E1" },// "downloading",
        5: { name: "等待做种", severity: "constrast", icon: "pi-angle-up", color: "#008000" },// "queued to seed",
        6: { name: "做种中", severity: "success", icon: "pi-angle-double-up", color: "#008000" },// "seeding"
    }
    const meaning = statusMap[value];
    if (meaning !== undefined) {
        return meaning;
    } else {
        return "Unknown status";
    }
};

const handleClick = (value) => {
    console.log("Clicked item:", value);
    let action_str = "";
    let dialog_type = "";
    if (value == "start") {
        action_str = "start";
    }
    if (value == "pause") {
        action_str = "stop";
    }
    if (value == "changeDir") {
        dialog_type = "0"; // path: "原路径or含种子文件", name: "文件或路径新名字"
        action_str = "rename-path";
    }
    if (value == "delete") {
        dialog_type = "1"; // delete-local-data: true
        action_str = "remove";
    }
    if (value == "verify") {
        action_str = 'verify';
    }
    console.log('action_str', action_str)
    console.log('dialog_type', dialog_type)

    if (dialog_type == "0") {
        if (selectedTorrents.value.length >= 1) {
            visible_change_location.value = true
        } else {
            toast.add({ severity: 'info', summary: '未选择种子', detail: '请选择种子后再进行操作', life: 3000 });
        }
    }
    if (dialog_type == "1") {
        if (selectedTorrents.value.length >= 1) {
            visible_delete.value = true
        } else {
            toast.add({ severity: 'info', summary: '未选择种子', detail: '请选择种子后再进行操作', life: 3000 });
        }
    }
    // TransmissionRPC.setServer()
    //     .then(async (response) => {
    //         await TransmissionRPC.torrentAction("set",)
    //             .then((res) => {
    //                 console.log('res', res)
    //                 // console.log('torrent:', torrents)
    //             })
    //             .catch((err) => {
    //                 console.log('err', err)
    //             })
    //     })
    //     .catch((error) => {
    //         if (error.message) {
    //             console.log('setServer, err', error)
    //         }
    //     })

}

const addLabel = () => {
    // value
    // selectedTorrents.value.length
    let torrent_ids = selectedTorrents.value.map(item => item.id)
    console.log('add label to these torrents')
    TransmissionRPC.setServer()
        .then(async (response) => {
            await TransmissionRPC.torrentAction("set", torrent_ids, { 'labels': ['音乐[sep]#FF9632'] })
                .then((res) => {
                    console.log('res', res)
                })
                .catch((err) => {
                    console.log('err', err)
                })
        })
        .catch((error) => {
            if (error.message) {
                console.log('setServer, err', error)
            }
        })
}

const toggleLimit = () => {
    isLimited.value = !isLimited.value
}

const toggleLabel = (event, id) => {
    op_label.value.toggle(event);
    addLabelsToOne(id);
}
const addLabelsToOne = (id) => {
    // op_label.value.toggle();
    let torrent_ids = [id]
    console.log('add label to these torrents', torrent_ids)
    // TransmissionRPC.setServer()
    //     .then(async (response) => {
    //         await TransmissionRPC.torrentAction("set", torrent_ids, { 'labels': ['音乐[sep]#FF9632'] })
    //             .then((res) => {
    //                 console.log('res', res)
    //             })
    //             .catch((err) => {
    //                 console.log('err', err)
    //             })
    //     })
    //     .catch((error) => {
    //         if (error.message) {
    //             console.log('setServer, err', error)
    //         }
    //     })

}
function lightenColor(hex, percent) {
    // 去掉#号
    hex = hex.replace(/^#/, '');

    // 将16进制转换为RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // 计算变淡后的颜色值
    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));

    // 将RGB转换回16进制
    const newHex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

    return newHex;
}

const labelParse = (texts) => {
    const parsed_labels = texts.map((text) => {
        const [name, color] = text.split("[sep]");
        const color_lighten = lightenColor(color, 0.7)
        return { name, color, color_lighten };
    })
    return parsed_labels
}
</script>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}</style>
