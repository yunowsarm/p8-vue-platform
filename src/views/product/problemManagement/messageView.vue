<template>
  <div style="height: 100%;">
    <P8FormDataEdit :record="{ desformCode: 'problemManagement' }"
                    :dataViewId="taskId"
                    page-type="view" />
  </div>
</template>

<script>

export default {
  name: 'messageView',
  props: ['taskId'],
}

</script>
