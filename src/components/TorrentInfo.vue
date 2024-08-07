<template>
    <div class="card">
        <Tabs value="0">
            <TabList>
                <Tab v-for="tab in items" :value="tab.value">
                    <i :class="tab.icon" />
                    {{ tab.label }}
                    <span class="material-icons">rocket_launch</span>
                </Tab>
            </TabList>
            
            <TabPanels>
                <TabPanel v-for="pan in items" :value="pan.value">
                    <component :is="pan.component"></component>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup>
import { FileTree } from "@/components/FileTrees.vue";
import { ref } from "vue";
const items = ref([
    {label:'常规', value:"0", icon: 'pi pi-box', component: null},
    {label:'服务器', value:"1", icon: 'pi pi-server', component: null},
    {label:'文件', value:"2", icon: 'pi pi-folder-open', component: FileTree},
    {label:'用户', value:"3", icon: 'pi pi-user', component: null},
    {label:'设置', value:"4", icon: 'pi pi-cog', component: null},
]);

</script>
