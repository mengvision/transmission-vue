properties <template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Filtering</div>
        <DataTable
            :value="torrents"
            :paginator="true"
            :rows="20"
            dataKey="id"
            :rowHover="true"
            v-model:selection="selectedTorrents"
            v-model:filters="filters"
            selectionMode="multiple"
            sortMode="multiple"
            size="small"
            filterDisplay="menu"
            :loading="loading1"
            :globalFilterFields="['name', 'downloadDir']"
            v-model:expandedRows="expandedRows"
        >
        <!-- :filters="filters" -->

            <template #header>
                <div class="flex justify-between">
                    <Button v-for="b in buttons" :icon="b.icon" :severity="b.severity" text rounded :aria-label="b.label"/>
                    <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" />
                    <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
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
                    {{ data.name }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" sortable type="text" placeholder="Search by name" />
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
            
            <Column field="percentDone" header="进度" :showFilterMatchModes="false" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <ProgressBar :value="data.percentDone*100" :showValue="false" style="height: 6px"></ProgressBar>
                </template>
                <template #filter="{ filterModel }">
                    <Slider v-model="filterModel.value" range class="m-4"></Slider>
                    <div class="flex items-center justify-between px-2">
                        <span>{{ filterModel.value ? filterModel.value[0] : 0 }}</span>
                        <span>{{ filterModel.value ? filterModel.value[1] : 100 }}</span>
                    </div>
                </template>
            </Column>

            <!-- <Column header="addedDate" filterField="addedDate" dataType="date" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ formatDate(data.addedDate) }}
                </template>
                <template #filter="{ filterModel }">
                    <DatePicker v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" />
                </template>
            </Column> -->
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
                            <FloatingConfigurator/>
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

import { ProductService } from '@/service/ProductService';
import { TransmissionRPC } from '@/service/TransmissionRPC';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { onBeforeMount, ref } from 'vue';

const items = ref([
    {label:'常规', value:"0", icon: 'pi pi-box', component: null},
    {label:'服务器', value:"1", icon: 'pi pi-server', component: null},
    {label:'文件', value:"2", icon: 'pi pi-folder-open', component: null},
    {label:'用户', value:"3", icon: 'pi pi-user', component: null},
    {label:'设置', value:"4", icon: 'pi pi-cog', component: null},
]);

const buttons = ref([ 
    // {label:'添加种子', icon:'pi pi-plus', severity:''}, //severity决定颜色
    // {label:'全局限速', icon:'pi pi-plus', severity:''},
    {label:'全部开始', icon:'pi pi-play', severity:'success'},
    {label:'全部暂停', icon:'pi pi-pause', severity:'warn'},
    {label:'修改文件目录', icon:'pi pi-file-export', severity:'info'},
    {label:'删除任务', icon:'pi pi-trash', severity:'danger'},
    {label:'重新校验', icon:'pi pi-check-circle', severity:'secondary'}, 
]);
const torrentInfo = ref({ label: '服务器', value: 'small' });
const torrentInfoOptions = ref([
    { label: '服务器', value: 'small' },
    { label: '文件', value: 'null' },
    { label: '用户', value: 'large' }
]);

const selectedTorrents = ref();
const op2 = ref(null);

const torrents = ref(null);
const filters = ref(null);
const loading1 = ref(null);
const products = ref(null);
const expandedRows = ref([]);

onBeforeMount(() => {
    ProductService.getProductsWithOrdersSmall().then((data) => (products.value = data));
    // CustomerService.getCustomersLarge().then((data) => {
    //     torrents.value = data;
    //     loading1.value = false;
    //     // torrents.value.forEach((customer) => (customer.date = new Date(customer.date)));
    // });
    TransmissionRPC.setServer()
        .then(async (response) => {
            await TransmissionRPC.getTorrents()
            .then((res) => {
                console.log('res', res)
                torrents.value = res.torrents;
                // console.log('torrent:', torrents)
            })
            .catch((err) => {
                console.log('err', err)
            })          

        })
        .catch((error) => {
          if(error.message){
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
    expandedRows.value = products.value.reduce((acc, p) => (acc[p.id] = true) && acc, {});
};

const collapseAll = () => {
    expandedRows.value = null;
};

const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatSize = (bytes, speed) => {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    while (bytes >= 1024 && unitIndex < units.length - 1) {
        bytes /= 1024;
        unitIndex++;
    }
    if(speed){
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

const siteNameToPTname = (a) =>{
    var site2PT = {
        "hdkylin": "麒麟",
        "hdkyl": "麒麟",
        "rousi":"肉丝",
        "icc2022":"冰淇淋",
        "czhch":"冰淇淋",
        "carpt":"车站",
        "jptv":"JPTV",
        "hamsters": "蝴蝶",
        "m-team": "馒头",
        "piggo": "猪猪",
        "pttime": "PTT",
        "xingtan": "杏坛",
        "gtk": "GTK",
        "nextpt": "飞天拉面",
        "connects":"飞天拉面",
        "crabpt": "蟹黄堡",
        "ubits": "U堡",
        "0ff": "农场",
        "btschool": "学校"
    }
    var pt = site2PT.hasOwnProperty(a) ? site2PT[a] : a;
    return pt
}


const formatDate = (value) => {
    return value.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

</script>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
