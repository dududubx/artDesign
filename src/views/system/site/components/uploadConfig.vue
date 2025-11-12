<template>
  <ElForm
    :model="form"
    class="form"
    ref="ruleFormRef"
    :rules="rules"
    label-width="150px"
    label-position="top"
  >
    <ElFormItem label="默认上传方式" prop="default">
      <ElRadioGroup v-model="form.default" @change="radioChange">
        <ElRadio value="local"> 本地上传 </ElRadio>
        <ElRadio value="aliyun"> 阿里云 </ElRadio>
      </ElRadioGroup>
    </ElFormItem>
    <ElFormItem label="存储空间名称Bucket" prop="bucket" v-if="form.default === 'aliyun'">
      <ElInput v-model="form.engine[0].bucket" placeholder="" />
    </ElFormItem>
    <ElFormItem label="AccessKeyld" prop="access_key_id" v-if="form.default === 'aliyun'">
      <ElInput v-model="form.engine[0].access_key_id" placeholder="" />
    </ElFormItem>
    <ElFormItem label="AccessKeysecret" prop="access_key_secret" v-if="form.default === 'aliyun'">
      <ElInput v-model="form.engine[0].access_key_secret" placeholder="" />
    </ElFormItem>
    <ElFormItem label="空间域名Domain" prop="domain" v-if="form.default === 'aliyun'">
      <ElInput v-model="form.engine[0].domain" placeholder="">
        <template #prepend>Http://</template>
      </ElInput>
    </ElFormItem>
    <ElRow justify="center" class="bottom-btn" align="bottom">
      <el-col :span="12">
        <ElFormItem>
          <el-button type="primary" @click="handleSave" v-ripple> 保存 </el-button>
        </ElFormItem>
      </el-col>
    </ElRow>
  </ElForm>
</template>

<script setup lang="ts">
  import { ElForm, FormRules } from 'element-plus'
  import { useUploadConfigStore } from '@/store/modules/uploadConfig'
  import { updateUploadConfig } from '@/api/uploadConfig'
  import { useMessage } from '@/composables/useMessage'

  const uploadStore = useUploadConfigStore()
  const { $message } = useMessage()

  const form = reactive({
    default: 'local',
    engine: [
      {
        type: 'aliyun',
        bucket: '',
        access_key_id: '',
        access_key_secret: '',
        domain: ''
      },
      {
        type: 'local'
      }
    ]
  })
  const rules = reactive<FormRules>({
    default: [{ required: true, message: '请选择默认上传方式', trigger: 'change' }]
  })
  const handleSave = () => {
    updateUploadConfig(form).then((res) => {
      if (res.code == 200) {
        $message({
          type: 'success',
          message: '保存成功'
        })
      }
    })
  }
  const radioChange = (val: any) => {
    if (val === 'local') {
      form.engine = [
        {
          type: 'aliyun',
          bucket: '',
          access_key_id: '',
          access_key_secret: '',
          domain: ''
        },
        {
          type: 'local'
        }
      ]
    }
  }
  onMounted(() => {
    Object.assign(form, uploadStore.uploadConfig)
  })
</script>

<style lang="scss" scoped></style>
