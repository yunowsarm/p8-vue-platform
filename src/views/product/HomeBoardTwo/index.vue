<template>
    <div class="demand-table">
        <div class="table-column" v-for="(item, index) in Object.keys(listObj)" :key="index">
            <div class="column-title">{{ item }}</div>
            <div class="column-item" v-for="el in listObj[item]" :key="el.id" @click="itemClick(el)">
                <span class="item-number">{{ el.demandNum }}</span>：<span class="item-name">{{ el.demandName }}</span>
            </div>
        </div>
        <common-drawer v-if="visibleProcessDrawer"
                   :visible="visibleProcessDrawer"
                   title="查看"
                   @close="closeMyApproval"
                   size="50%">
        <template #drawer>
                <formView v-if="visibleProcessDrawer" :row="row"></formView>
        </template>
    </common-drawer>
    </div>
</template>

<script>
import { P8Drawer as CommonDrawer} from 'p8-components-ui'
import formView from '@/views/product/DemandInformation/formView.vue'
export default {
    data() {
        return {
            listObj: {},
            row: [],
            visibleProcessDrawer: false
        }
    },
    components:{
        CommonDrawer,
        formView
    },
    created() {
        this.$api['demandManagement.getRequirementByStatus']({}).then(res => {
            this.listObj = res;
        });
    },
    methods: {
        itemClick(item) {
            this.row = [item]
            this.visibleProcessDrawer = true
        },
        closeMyApproval () {
            this.visibleProcessDrawer = false
        }
    }
};
</script>

<style scoped lang="scss">
.demand-table {
    display: flex;
    height: 100%;
    text-align: center;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.table-column {
    flex: 1;
    border-right: 1px solid #e0e0e0;

    &:last-child {
        border-right: none;
    }
}

.column-title {
    padding: 16px;
    background-color: #f5f5f5;
    font-weight: 600;
    font-size: 16px;
    color: #333;
    border-bottom: 1px solid #e0e0e0;
}

.column-item {
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
    transition: background-color 0.2s ease;

    &:last-child:not(:only-child) {
        border-bottom: none;
    }

    &:hover {
        background-color: #f9f9f9;
    }
}

.column-item.column-item:last-child {
    border-bottom: 1px solid #e0e0e0;
}

.item-number {
    font-weight: 500;
    color: #008ee0;
}

.item-name {
    color: #666;
}
</style>