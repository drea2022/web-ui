<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="视频名称" prop="vidName">
        <el-input
          v-model="queryParams.vidName"
          placeholder="请输入视频名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="视频地址" prop="vidUrl">
        <el-input
          v-model="queryParams.vidUrl"
          placeholder="请输入视频地址"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="等级" prop="level">
        <el-input
          v-model="queryParams.level"
          placeholder="请输入等级"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="statue">
        <el-input
          v-model="queryParams.statue"
          placeholder="请输入状态"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['system:video:add']"
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
          v-hasPermi="['system:video:edit']"
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
          v-hasPermi="['system:video:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:video:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="videoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="视频ID" align="center" prop="oneId" />
      <el-table-column label="视频名称" align="center" prop="vidName" />
      <el-table-column label="视频" align="center" prop="vidUrl" >
      <template slot-scope="scope">
        <el-image :src="scope.row.vidUrl "></el-image>
<!--        <div>{{// scope.row.vidUrl}}</div>-->
      </template>
      </el-table-column>
<!--      服务器存储的地址发过来  和这个字段拼接一下   用img video  标签展示-->
      <el-table-column label="等级" align="center" prop="level" />
      <el-table-column label="状态" align="center" prop="statue" />
<!--      <el-table-column label="页面展示位置" align="center" prop="location" />-->
<!--      <el-table-column label="状态" width="120">-->
<!--        <template slot-scope="scope">-->
<!--          <el-tag type="success" effect="dark" v-if="scope.form.statue==1">可用</el-tag>-->
<!--          <el-tag type="warning" effect="dark" v-if="scope.form.statue==2">不可用</el-tag>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:video:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:video:remove']"
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

    <!-- 添加或修改视频管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="视频名称" prop="vidName">
          <el-input v-model="form.vidName" placeholder="请输入视频名称" />
        </el-form-item>
        <el-form-item label="视频" prop="fileUrl">
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
           <div class="el-upload__text">
           将文件拖到此处，或<em>点击上传</em>
           </div>
           </el-upload>
           </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-input v-model="form.level" placeholder="请输入等级" />
        </el-form-item>
<!--        <el-form-item label="页面展示位置" prop="location">-->
<!--          <el-input v-model="form.location" placeholder="请输入页面展示位置" />-->
<!--        </el-form-item>-->
        <el-form-item label="状态" prop="level">
          <el-input v-model="form.statue" placeholder="请输入状态" />
        </el-form-item>
<!--        <el-form-item label="状态" prop="statue">-->
<!--          <el-radio v-model="form.status" label="1">可用</el-radio>-->
<!--          <el-radio v-model="form.status" label="2">不可用</el-radio>-->
<!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listVideo, getVideo, delVideo, addVideo, updateVideo } from "@/api/system/video";

export default {
  name: "Video",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      //文件上传
      fileList: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 视频管理表格数据
      videoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        vidName: null,
        vidUrl: null,
        level: null,
        location: null,
        statue: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      // 图片前缀
      imgUrl:'http://120.48.50.16:8080/',
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询视频管理列表 */
    getList() {
      this.loading = true;
      listVideo(this.queryParams).then(response => {
        this.videoList = response.rows;
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
      this.form.vidUrl = e.url;
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
        oneId: null,
        vidName: null,
        vidUrl: null,
        level: null,
        location: null,
        statue: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
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
      this.ids = selection.map(item => item.oneId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加视频管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const oneId = row.oneId || this.ids
      getVideo(oneId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改视频管理";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.oneId != null) {
            updateVideo(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addVideo(this.form).then(response => {
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
      const oneIds = row.oneId || this.ids;
      this.$modal.confirm('是否确认删除视频管理编号为"' + oneIds + '"的数据项？').then(function() {
        return delVideo(oneIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/video/export', {
        ...this.queryParams
      }, `video_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
