<template>
  <main class="benefit-policy-page">
    <section class="policy-panel">
      <div class="panel-tabs" role="tablist" aria-label="惠企政策内容类型">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.key"
          :class="['panel-tab', { active: activeTab === tab.key }]"
          @click="changeTab(tab.key)">
          <i :class="tab.icon" aria-hidden="true"></i>
          {{ tab.label }}
        </button>
      </div>

      <div class="policy-toolbar">
        <span class="result-count">
          共
          <b>{{ total }}</b>
          条{{ activeTab === 'policy' ? '政策' : '解读' }}
        </span>
        <label class="sr-only" for="benefit-policy-search">搜索政策标题</label>
        <el-input id="benefit-policy-search" v-model.trim="searchWord" clearable size="small" placeholder="搜索政策标题" prefix-icon="el-icon-search" @keyup.enter.native="search" @clear="search">
          <el-button type="primary" :disabled="!searchWord" @click="search">搜索</el-button>
        </el-input>
      </div>

      <div v-loading="loading" v-if="records.length" class="policy-grid" role="tabpanel">
        <article v-for="item in records" :key="item.id" class="policy-card">
          <button type="button" class="policy-card__button" :aria-label="`打开政策：${item.title}`" @click="openPolicy(item)">
            <div class="card-heading">
              <span class="card-icon"><i :class="activeTab === 'policy' ? 'el-icon-document' : 'el-icon-reading'" aria-hidden="true"></i></span>
              <h2>{{ item.title }}</h2>
            </div>
            <p class="card-summary">{{ item.docAbstract }}</p>
            <footer class="card-footer">
              <span>
                <i class="el-icon-office-building" aria-hidden="true"></i>
                {{ item.publishDept }}
              </span>
              <time>
                <i class="el-icon-date" aria-hidden="true"></i>
                {{ item.publishDocTime }}
              </time>
              <i class="el-icon-arrow-right card-arrow" aria-hidden="true"></i>
            </footer>
          </button>
        </article>
      </div>

      <el-empty v-else description="暂无符合条件的政策信息" />

      <div v-if="total > pageSize" class="pagination-row">
        <span>每页 {{ pageSize }} 条</span>
        <el-pagination background :current-page="currentPage" :page-size="pageSize" :total="total" layout="prev, pager, next" @current-change="changePage" />
      </div>
    </section>
  </main>
</template>

<script>
const MOCK_RECORDS = {
  policy: [
    {
      id: 'policy-01',
      title: '关于进一步做好财政金融协同促内需政策有关工作的通知',
      docAbstract: '扩大贴息范围，强化财政金融协同，进一步激发民间投资和消费潜力。',
      publishDept: '财政部 中国人民银行 金融监管总局',
      publishDocTime: '2026-08-21',
      url: 'https://www.gov.cn/zhengce/zhengceku/202608/content_7078798.htm'
    },
    {
      id: 'policy-02',
      title: '国务院办公厅关于进一步促进民间投资发展的若干措施',
      docAbstract: '持续优化营商环境，鼓励民间资本参与重大项目建设，支持企业稳定发展。',
      publishDept: '国务院办公厅',
      publishDocTime: '2026-08-18',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'policy-03',
      title: '关于加快推进科技创新和产业创新深度融合的实施意见',
      docAbstract: '支持企业加强关键核心技术攻关，推动科技成果转化和产业化应用。',
      publishDept: '科技部 工业和信息化部',
      publishDocTime: '2026-08-15',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'policy-04',
      title: '关于促进中小企业专精特新发展的指导意见',
      docAbstract: '完善梯度培育体系，提升中小企业专业化、精细化、特色化和创新能力。',
      publishDept: '工业和信息化部',
      publishDocTime: '2026-08-12',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'policy-05',
      title: '关于支持制造业高质量发展的若干财政政策',
      docAbstract: '聚焦设备更新、数字化转型和绿色发展，提升制造业核心竞争力。',
      publishDept: '财政部',
      publishDocTime: '2026-08-08',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'policy-06',
      title: '关于进一步优化企业融资服务的通知',
      docAbstract: '引导金融机构加大对小微企业、科技创新和绿色发展的金融支持力度。',
      publishDept: '中国人民银行',
      publishDocTime: '2026-08-05',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'policy-07',
      title: '关于做好稳外贸稳外资工作的若干措施',
      docAbstract: '优化贸易便利化服务，支持企业开拓多元化国际市场和参与国际合作。',
      publishDept: '商务部',
      publishDocTime: '2026-08-01',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'policy-08',
      title: '关于推动服务业高质量发展的若干意见',
      docAbstract: '促进现代服务业与先进制造业深度融合，培育服务消费新增长点。',
      publishDept: '国家发展改革委',
      publishDocTime: '2026-07-28',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'policy-09',
      title: '关于加强企业数据资源开发利用的指导意见',
      docAbstract: '推进数据要素市场化配置，支持企业安全合规地开发利用数据资源。',
      publishDept: '国家数据局',
      publishDocTime: '2026-07-24',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'policy-10',
      title: '关于促进绿色低碳产业发展的政策措施',
      docAbstract: '支持企业实施节能降碳改造，积极发展绿色制造和循环经济。',
      publishDept: '生态环境部',
      publishDocTime: '2026-07-20',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'policy-11',
      title: '关于加强人才服务保障助力企业发展的通知',
      docAbstract: '优化人才引进、培养和服务机制，帮助企业集聚发展所需人才。',
      publishDept: '人力资源和社会保障部',
      publishDocTime: '2026-07-16',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'policy-12',
      title: '关于持续优化营商环境激发市场活力的意见',
      docAbstract: '规范涉企行政行为，降低制度性交易成本，营造公平透明的市场环境。',
      publishDept: '国务院办公厅',
      publishDocTime: '2026-07-12',
      url: 'https://www.gov.cn/zhengce/'
    }
  ],
  unscramble: [
    {
      id: 'unscramble-01',
      title: '政策解读：财政金融协同如何更好服务企业发展',
      docAbstract: '从扩大贴息范围、优化融资服务等方面，解读政策为企业带来的支持。',
      publishDept: '中国政府网',
      publishDocTime: '2026-08-22',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'unscramble-02',
      title: '专家解读：提振民间投资释放发展新动能',
      docAbstract: '围绕项目推介、要素保障和融资支持，梳理促进民间投资的重点举措。',
      publishDept: '国家发展改革委',
      publishDocTime: '2026-08-19',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'unscramble-03',
      title: '一图读懂：中小企业专精特新培育政策',
      docAbstract: '用图文说明企业申报条件、培育路径和重点支持方向。',
      publishDept: '工业和信息化部',
      publishDocTime: '2026-08-16',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'unscramble-04',
      title: '政策问答：制造业数字化转型有哪些支持',
      docAbstract: '针对企业关心的改造方向、申报流程和服务资源进行集中答疑。',
      publishDept: '工业和信息化部',
      publishDocTime: '2026-08-13',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'unscramble-05',
      title: '权威解读：小微企业融资服务再升级',
      docAbstract: '介绍金融机构为小微企业提供融资便利、降低综合融资成本的具体方式。',
      publishDept: '中国人民银行',
      publishDocTime: '2026-08-09',
      url: 'https://www.gov.cn/zhengce/'
    },
    {
      id: 'unscramble-06',
      title: '政策解读：稳外贸举措如何帮助企业开拓市场',
      docAbstract: '聚焦跨境贸易便利化、出口信用保险和海外市场拓展等支持措施。',
      publishDept: '商务部',
      publishDocTime: '2026-08-06',
      url: 'https://www.gov.cn/zhengce/'
    }
  ]
}

const POLICY_API_PATHS = {
  policy: '/gov-policy/zhengce/qiye/trssearch/search/all',
  unscramble: '/gov-policy/zhengce/qiye/trssearch/search/unscramble'
}

export default {
  name: 'BenefitPolicy',
  data() {
    return {
      activeTab: 'policy',
      searchWord: '',
      currentPage: 1,
      pageSize: 10,
      loading: false,
      records: [],
      total: 0,
      tabs: [
        { key: 'policy', label: '惠企政策', icon: 'el-icon-document' },
        { key: 'unscramble', label: '政策解读', icon: 'el-icon-reading' }
      ]
    }
  },
  created() {
    this.loadRecords()
  },
  methods: {
    changeTab(tab) {
      if (this.activeTab === tab) return
      this.activeTab = tab
      this.searchWord = ''
      this.currentPage = 1
      this.loadRecords()
    },
    search() {
      this.currentPage = 1
      this.loadRecords()
    },
    changePage(page) {
      this.currentPage = page
      this.loadRecords()
    },
    requestPayload() {
      return {
        dbname: '',
        currpage: this.currentPage,
        pagesize: this.pageSize,
        searchWord: this.searchWord,
        searchField: 'title',
        searchSort: 'time',
        docType: this.activeTab === 'policy' ? '1' : '2',
        publishDept: '',
        hqType: '',
        enterpriseType: '',
        enterpriseScale: '',
        lifeCycle: 0
      }
    },
    normalizeRecords(records) {
      return (Array.isArray(records) ? records : []).map((item, index) =>
        Object.assign({}, item, {
          id: item.id || `${item.url || item.title || 'policy'}-${this.currentPage}-${index}`,
          docAbstract: item.docAbstract || item.content || '暂无摘要'
        })
      )
    },
    loadMockRecords() {
      const keyword = this.searchWord.toLowerCase()
      const filtered = MOCK_RECORDS[this.activeTab].filter((item) => !keyword || `${item.title}${item.docAbstract}${item.publishDept}`.toLowerCase().includes(keyword))
      const start = (this.currentPage - 1) * this.pageSize
      this.records = this.normalizeRecords(filtered.slice(start, start + this.pageSize))
      this.total = filtered.length
    },
    async loadRecords() {
      const request = this.$axios
      if (!request) {
        this.loadMockRecords()
        return
      }
      this.loading = true
      try {
        const response = await request.post(POLICY_API_PATHS[this.activeTab], this.requestPayload())
        const result = response && response.data !== undefined ? response.data : response
        if (!result || Number(result.code) !== 0) throw new Error('政策接口返回异常')
        const data = result.data || {}
        this.records = this.normalizeRecords(data.list)
        this.total = Number(data.totalRecords || this.records.length)
      } catch (error) {
        this.loadMockRecords()
        this.$message.warning('政策服务暂不可用，已展示模拟数据')
      } finally {
        this.loading = false
      }
    },
    openPolicy(item) {
      if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer')
    }
  }
}
</script>

<style scoped>
.benefit-policy-page {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
  color: #3a4f6a;
}
.policy-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  min-height: 148px;
  padding: 28px 32px;
  box-sizing: border-box;
  border-radius: 8px;
  background: linear-gradient(115deg, #edf6ff 0%, #f8fbff 100%);
}
.eyebrow {
  margin: 0 0 8px;
  color: #3387ee;
  font-size: 14px;
  font-weight: 600;
}
.eyebrow i,
.source-note i {
  margin-right: 7px;
}
.policy-hero h1 {
  margin: 0;
  color: #294b70;
  font-size: 28px;
  line-height: 1.35;
}
.policy-hero > div > p:last-child {
  margin: 8px 0 0;
  color: #6e87a2;
  font-size: 14px;
}
.source-note {
  margin-bottom: 4px;
  color: #7d95af;
  font-size: 13px;
  white-space: nowrap;
}
.policy-panel {
  min-height: 570px;
  margin-top: 16px;
  padding: 20px 24px 24px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(33 75 119 / 4%);
}
.panel-tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #e8eef5;
}
.panel-tab {
  min-height: 44px;
  padding: 0 4px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #526d89;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
}
.panel-tab i {
  margin-right: 7px;
  font-size: 16px;
}
.panel-tab:hover,
.panel-tab:focus-visible,
.panel-tab.active {
  border-bottom-color: #3387ee;
  color: #3387ee;
}
.panel-tab:focus-visible,
.policy-card__button:focus-visible {
  outline: 2px solid #3387ee;
  outline-offset: 2px;
}
.policy-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 0 18px;
}
.result-count {
  color: #7d8fa3;
  font-size: 13px;
}
.result-count b {
  color: #3387ee;
  font-weight: 600;
}
.policy-toolbar .el-input {
  width: min(100%, 380px);
}
.policy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.policy-card {
  min-width: 0;
  border: 1px solid #e7edf4;
  border-radius: 6px;
  background: #fff;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}
.policy-card:hover {
  border-color: #bad9fb;
}
.policy-card__button {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 166px;
  padding: 18px 20px 16px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}
.card-heading {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.card-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  background: #edf6ff;
  color: #3387ee;
  font-size: 15px;
}
.card-heading h2 {
  display: -webkit-box;
  overflow: hidden;
  margin: 2px 0 0;
  color: #365779;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.policy-card:hover h2 {
  color: #2678dc;
}
.card-summary {
  display: -webkit-box;
  overflow: hidden;
  min-height: 43px;
  margin: 12px 0 0;
  color: #8192a6;
  font-size: 13px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.card-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 14px;
  color: #8b9aad;
  font-size: 12px;
}
.card-footer span,
.card-footer time {
  display: inline-flex;
  min-width: 0;
  align-items: center;
}
.card-footer span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.card-footer i:not(.card-arrow) {
  margin-right: 4px;
}
.card-arrow {
  flex: 0 0 auto;
  margin-left: auto;
  color: #9fb1c5;
  font-size: 15px;
}
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 24px;
  color: #8b9aad;
  font-size: 13px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 900px) {
  .policy-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 760px) {
  .benefit-policy-page {
    padding: 8px;
  }
  .policy-hero {
    display: block;
    min-height: 0;
    padding: 22px 20px;
  }
  .policy-hero h1 {
    font-size: 24px;
  }
  .source-note {
    display: block;
    margin-top: 16px;
  }
  .policy-panel {
    min-height: 0;
    margin-top: 10px;
    padding: 14px 16px 18px;
  }
  .policy-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }
  .policy-toolbar .el-input {
    width: 100%;
  }
  .card-footer {
    flex-wrap: wrap;
  }
  .pagination-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
@media (prefers-reduced-motion: reduce) {
  .policy-card {
    transition: none;
  }
  .policy-card:hover {
    transform: none;
  }
}
</style>
