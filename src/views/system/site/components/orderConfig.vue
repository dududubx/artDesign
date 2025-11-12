<template>
  <ElForm
    :model="form"
    class="form"
    ref="ruleFormRef"
    :rules="rules"
    label-width="86px"
    label-position="top"
  >
    <ElRow>
      <el-col :span="12">
        <ElFormItem label="店铺名称" prop="realName">
          <el-input v-model="form.realName" show-word-limit maxlength="20" clearable />
          <div class="tips-text"> 请注意，店铺名称部180天内仅可修改两次,请谨慎填写。 </div>
        </ElFormItem>
      </el-col>
    </ElRow>
    <ElRow>
      <el-col :span="12">
        <ElFormItem label="店铺ID" prop="id">
          <div class="input-wrap">
            <div class="input-label">
              {{ form.id }}
            </div>
            <div class="copy-icon" @click="copyID">
              <el-icon><CopyDocument /></el-icon><span>复制</span>
            </div>
          </div>
        </ElFormItem>
      </el-col>
    </ElRow>
    <ElRow>
      <el-col :span="12">
        <ElFormItem label="店铺标志" prop="id">
          <ArtUploadFile></ArtUploadFile>
          <el-upload
            v-model:file-list="form.logo"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            accept="image/png, image/jpeg, image/gif, image/jpg"
            :class="{ 'hidden-upload': form.logo.length > 0 }"
            :on-change="changeFile"
          >
            <el-icon><Plus /></el-icon>
            <template #file="{ file }">
              <div>
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-preview"
                    @click="handlePictureCardPreview(file)"
                  >
                    <el-icon><zoom-in /></el-icon>
                  </span>
                  <span class="el-upload-list__item-delete" @click="handleDownload(file)">
                    <el-icon><Download /></el-icon>
                  </span>
                  <span class="el-upload-list__item-delete" @click="handleRemove(file)">
                    <el-icon><Delete /></el-icon>
                  </span>
                </span>
              </div>
            </template>
          </el-upload>
        </ElFormItem>
      </el-col>
    </ElRow>
    <ElRow>
      <el-col :span="12">
        <ElFormItem label="联系地址" prop="realName">
          <ElRow :gutter="10">
            <el-col :span="6">
              <el-select v-model="form.province" placeholder="请选择省份">
                <el-option label="广东省" value="广东省"></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="form.city" placeholder="请选择城市">
                <el-option label="广州市" value="广州市"></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="form.area" placeholder="请选择区县">
                <el-option label="天河区" value="天河区"></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="form.street" placeholder="请选择街道">
                <el-option label="广州街" value="广州街"></el-option>
              </el-select>
            </el-col>
          </ElRow>
          <ElRow>
            <el-col :span="24">
              <el-input v-model="form.address" maxlength="200" clearable />
            </el-col>
          </ElRow>
        </ElFormItem>
      </el-col>
    </ElRow>
    <ElRow>
      <el-col :span="12">
        <ElFormItem label="店铺联系人手机号" prop="mobile">
          <ElRow :gutter="10">
            <el-col :span="14">
              <el-input v-model="form.phoneNumer" placeholder="请选择电话号码">
                <el-option label="广东省" value="广东省"></el-option>
              </el-input>
            </el-col>
            <el-col :span="10">
              <el-input v-model="form.noteCode" placeholder="请输入验证码">
                <template #append>
                  <div class="code-btn"> 获取验证码 </div>
                </template>
              </el-input>
            </el-col>
          </ElRow>
        </ElFormItem>
      </el-col>
    </ElRow>
    <ElRow justify="center" class="bottom-btn" align="bottom">
      <el-col :span="12">
        <ElFormItem>
          <el-button type="primary" @click="handleSave" v-ripple> 保存 </el-button>
        </ElFormItem>
      </el-col>
    </ElRow>
  </ElForm>
  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script lang="ts" setup>
  import { ElForm, FormRules } from 'element-plus'
  import type { UploadFile } from 'element-plus'
  import { copyText } from '@/utils'
  import { fetchUploadFiles } from '@/api/uploadFiles'
  const form = reactive({
    realName: 'John Snow',
    nikeName: '皮卡丘',
    email: '59301283@mall.com',
    id: '18888888888',
    address: '广东省深圳市宝安区西乡街道101栋201',
    sex: '2',
    des: 'Art Design Pro 是一款漂亮的后台管理系统模版.',
    logo: <
      {
        name: string
        url: string
      }[]
    >[],
    province: '广东省',
    city: '广州市',
    area: '天河区',
    street: '广州街',
    phoneNumer: '',
    noteCode: ''
  })
  const rules = reactive<FormRules>({
    realName: [
      { required: true, message: '请输入店铺名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
    address: [{ required: true, message: '请输入地址', trigger: 'blur' }]
  })
  const dialogImageUrl = ref('')
  const dialogVisible = ref(false)
  const handleRemove = (file: UploadFile) => {
    form.logo = []
  }
  const changeFile = (file: UploadFile) => {
    const formData = new FormData()
    formData.append('file', file.raw as File)
    formData.append('pid', '15')
    fetchUploadFiles(formData).then((res) => {
      if (res.code === 200) {
        form.logo = [
          {
            name: file.name as string,
            url: res.data.url
          }
        ]
      }
    })
  }
  const handlePictureCardPreview = (file: UploadFile) => {
    dialogImageUrl.value = file.url!
    dialogVisible.value = true
  }

  const handleDownload = (file: UploadFile) => {
    console.log(file)
  }
  const handleSave = () => {}
  const copyID = () => {
    copyText(form.id)
  }
</script>

<style lang="scss" scoped>
  :deep(.input-wrap) {
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    gap: 5px;
    .input-label {
      flex: 1;
      width: 100%;
      height: 100%;
      line-height: 40px;
      padding: 1px 11px;
      color: var(--art-text-gray-500);
      background: repeating-linear-gradient(
        135deg,
        #ffffff,
        transparent,
        var(--art-text-gray-300) 6px
      );
    }
    .copy-icon {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
  :deep(.el-upload-list--picture-card) {
    --el-upload-list-picture-card-size: 95px;
    .el-upload--picture-card {
      --el-upload-picture-card-size: 95px;
    }
  }
  :deep(.hidden-upload) {
    .el-upload--picture-card {
      display: none;
    }
  }
  :deep(.el-dialog) {
    --el-dialog-margin-top: 5vh;
  }
  :deep(.el-form) {
    --el-text-color-regular: var(--el-text-color-primary);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: scroll;
    .el-form-item__content {
      gap: 10px;
      .el-row {
        width: 100%;
      }
    }
    .bottom-btn {
      height: 100%;
      flex: 1;
      .el-form-item__content {
        justify-content: center;
      }
    }
    .tips-text {
      color: var(--main-color);
    }
  }
</style>
