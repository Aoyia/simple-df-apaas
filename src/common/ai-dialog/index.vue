<template>
  <div class="ai-dialog-wrapper">
    <el-dialog
      custom-class="ai-dialog-dialog"
      :visible.sync="dialogVisible"
      width="560px"
      @close="close"
    >
      <div class="content">
        <div class="title">{{ title }}</div>
        <div class="text-content">{{ content }}</div>
        <div class="btn-group">
          <div class="btn sure" @click="handleConfirm">确认</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "AiDialog",
  data() {
    return {
      dialogVisible: false,
      title: "",
      content: "",
      modalResolve: null,
      modalReject: null,
    };
  },
  methods: {
    show({ title, content }) {
      this.dialogVisible = true;
      this.title = title;
      this.content = content;
      return new Promise((resolve, reject) => {
        this.modalResolve = resolve;
        this.modalReject = reject;
      });
    },
    close() {
      this.dialogVisible = false;
      this.$el.parentNode.removeChild(this.$el);
    },
    handleConfirm() {
      this.close();
      this.modalResolve();
    },
  },
};
</script>
