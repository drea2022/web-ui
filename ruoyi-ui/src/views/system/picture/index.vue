<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="图片名称" prop="picName">
        <el-input
          v-model="queryParams.picName"
          placeholder="请输入图片名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="等级" prop="picLevel">
        <el-input
          v-model="queryParams.picLevel"
          placeholder="请输入等级"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="statue">
        <el-input v-model="queryParams.statue" placeholder="请输入状态" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:picture:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:picture:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:picture:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:picture:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="pictureList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="图片ID" align="center" prop="picId" />
      <el-table-column label="图片名称" align="center" prop="picName" />
      <el-table-column label="图片" align="center" prop="picUrl" >
          <template slot-scope="scope" >
            <el-image :src=" scope.row.picUrl " ></el-image>
          </template>
      </el-table-column>
      <el-table-column label="页面位置" align="center" prop="picLevel" />
      <el-table-column label="项目位置" align="center" prop="location" />
      <el-table-column label="状态" align="center" prop="statue" >
        <template v-slot="scope">
          {{scope.row.statue == 1 ?'可用':'不可用'}}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:picture:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:picture:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改图片管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="图片名称" prop="picName">
          <el-input v-model="form.picName" placeholder="请输入图片名称" />
        </el-form-item>
        <el-form-item label="图片" prop="fileUrl" >
          <el-upload class="upload-demo" action="http://120.48.50.16:8080/common/upload"
                     :on-preview="handlePreview"
                     :on-remove="handleRemove"
                     :on-success="handSuccess"
                     :before-remove="beforeRemove"
                     multiple
                     :limit="1"
                     drag
                     :on-exceed="handleExceed"
                     :file-list="fileList"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text" >
              将文件拖到此处，或<em>点击上传</em>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="页面位置" prop="picLevel">
          <el-input v-model="form.picLevel" placeholder="请输入等级" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            @change="switchChange"
            v-model="value1"
            active-text="可用"
            inactive-text="不可用">
          </el-switch>
        </el-form-item>
        <el-form-item label="项目位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入等级" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPicture, getPicture, delPicture, addPicture, updatePicture } from "@/api/system/picture";

export default {
  name: "Picture",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      value1:true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 图片管理表格数据
      pictureList: [],
      fileList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        picName: null,
        picUrl: null,
        picLevel: null,
        location: null,
        statue: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      // 图片前缀
      imgUrl:'http://120.48.50.16:8080/'
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 开关状态改变
    switchChange(e) {
      if (e) {
        this.form.statue =1
      } else {
        this.form.statue =2
      }
    },
    /** 查询图片管理列表 */
    getList() {
      this.loading = true;
      listPicture(this.queryParams).then(response => {
        this.pictureList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    // 文件上传成功
    handSuccess(e) {
      console.log(e);
      this.form.picUrl = e.url;
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`
      );
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        picId: null,
        picName: null,
        picUrl: null,
        picLevel: null,
        location: null,
        statue: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        fileUrl:null,
        fileName:null,
        url:null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.picId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加图片管理";
      this.form.statue = 1
      this.fileList = []
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const picId = row.picId || this.ids
      getPicture(picId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改图片管理";
        if (this.form.statue == 1) {
          this.value1 = true
        } else {
          this.value1 = false
        }
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.picId != null) {
            updatePicture(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPicture(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const picIds = row.picId || this.ids;
      this.$modal.confirm('是否确认删除图片管理编号为"' + picIds + '"的数据项？').then(function() {
        return delPicture(picIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/picture/export', {
        ...this.queryParams
      }, `picture_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
