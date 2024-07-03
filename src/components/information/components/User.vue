<template>
  <div class="user"
       @click="onClick"
       :class="{ selected: selected }">
    <div class="description">
      <i class="el-icon-tickets"></i>
      <div class="right-content">
        <div class="name">
          {{ user.entityName }}
        </div>
        <!-- <div class="status">
          <status-icon v-if="connected===true || connected===false"
                       :connected="connected" />{{ status }}

        </div> -->
      </div>
    </div>
    <div v-if="user.messageCount > 0"
         class="new-messages">{{user.messageCount}}</div>
  </div>
</template>

<script>
import StatusIcon from "./StatusIcon";
export default {
  name: "User",
  components: { StatusIcon },
  props: {
    user: Object,
    selected: Boolean,
  },
  data () {
    return {
      connected: null
    }
  },
  mounted () {
  },
  methods: {
    onClick () {
      this.user.messageCount = 0
      this.$emit("select");
    },
  },
};
</script>

<style scoped>
.selected {
  background-color: #77b5e3;
}

.user {
  padding: 10px;
  border-bottom: 1px #cccccc solid;
  position: relative;
}

.description {
  display: flex;
  align-items: center;
}
.right-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 15px;
}
.user:hover {
  background: #6c8ba2;
}

.status {
  color: #92959e;
}

.new-messages {
  color: white;
  background-color: red;
  width: 20px;
  border-radius: 5px;
  text-align: center;
  position: absolute;
  right: 10px;
  top: 10px;
}
</style>
