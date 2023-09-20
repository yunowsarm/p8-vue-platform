<template>
  <div class="main">
    <div class="login-wrapper">
      <div class="login-block">
        <div class="login-contain">
          <span class="login-logo" ref="loginLogo"></span>
          <h4 class="login-sysName">{{ system_name }}</h4>
          <el-form
            class="loginForm"
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            size="small"
            v-loading="loading"
            element-loading-text="自动登录中......"
            element-loading-spinner="el-icon-loading"
            element-loading-custom-class="customClass"
          >
            <template v-if="!loading">
              <div style="margin-bottom: 6px"><i class="p8 icon-yonghuming" style="color: #094deb"></i>用户名</div>
              <el-form-item prop="userAccount">
                <el-input class="login-input" type="text" v-model="loginForm.userAccount" placeholder="请输入用户名、身份证"></el-input>
              </el-form-item>
              <div style="margin-bottom: 6px"><i class="p8 icon-mima" style="color: #094deb"></i>密码</div>
              <el-form-item prop="userPassword" class="userPassword">
                <el-input class="login-input" type="password" v-model="loginForm.userPassword" @keyup.enter.native="login('loginForm')" placeholder="请输入密码"></el-input>
              </el-form-item>

              <el-form-item class="keepLoggedIn">
                <el-checkbox v-model="keepLoggedIn">记住登录状态</el-checkbox>
              </el-form-item>

              <el-form-item>
                <el-button class="login-button" :loading="isLoginning" @click="login('loginForm')">登录</el-button>
              </el-form-item>
            </template>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Form, FormItem, Input, Checkbox, Button, Notification } from 'p8-components-ui'
import { mapGetters } from 'vuex'
import { getGreetingTime } from '@/utils/common'
import { setSession, removeSession } from '@/service/expands/session'
import GLOBAL_CONST from '@/config/const'
import { API_DEFAULT_CONFIG, CA_LOGIN, PLATFORM_PREFIX_NAME } from '@/config/settings'

const TOKEN_KEY = GLOBAL_CONST.token.tokenKey

function getRequest() {
  const url = window.location.href // 获取url中"?"符后的字串
  // eslint-disable-next-line no-new-object
  const theRequest = new Object()
  if (url.indexOf('?') !== -1) {
    const str = url.substr(1)
    const strs = str.split('&')
    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1])
    }
  }
  return theRequest
}

export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      systemLogo: '../../assets/image/login/logo.png',
      isLoginning: false,
      loginForm: {
        userAccount: '',
        userPassword: ''
      },
      keepLoggedIn: false, // 是否记住登录状态，默认不记住
      loginRules: {
        userAccount: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        userPassword: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      dayTime: '',
      system_name: 'PLATFORM_PREFIX_NAME',
      systemNames: PLATFORM_PREFIX_NAME,
      flag: 'systemModel1',
      loginCa: CA_LOGIN
    }
  },
  computed: {
    ...mapGetters(['userName', 'systemName'])
  },
  created() {
    console.log(API_DEFAULT_CONFIG)
  },
  mounted() {
    this.dayTime = getGreetingTime()
    // eslint-disable-next-line no-undef
    if (loginCa) {
      this.loginCheckCA()
    } else {
      this.loginCheck()
      Object.keys(getRequest()).length && this.autoLogin() // url携带参数
    }
  },
  methods: {
    autoLogin() {
      if (getRequest().token) {
        // url携带参数redirect，login?redirect=login&token=
        // ca信息登录
        // login?redirect=login&token=
        this.loading = true
        const token = getRequest().token.includes('#/login') ? getRequest().token.replace('#/login', '') : getRequest().token
        removeSession(TOKEN_KEY)
        this.$store.commit('SET_TOKEN', 'Bearer ' + token)
        setSession(TOKEN_KEY, 'Bearer ' + token)
        setTimeout(() => {
          this.$router.push('/dash')
        }, 2000)
      } else if (getRequest().redirect === 'signIn') {
        this.loading = true
        // signIn?redirect=P1&userAccount=zhangsan&userPassword=1
        removeSession(TOKEN_KEY)
        const { userAccount, userPassword } = getRequest()
        this.$store.dispatch('userLogin', { userAccount, userPassword }).then((res) => {
          setTimeout(() => {
            this.$router.push('/signIn')
          }, 2000)
        })
      }
    },
    login(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // eslint-disable-next-line no-unused-vars
          let userLoginSign = true
          this.$api['SystemSettings.getLoginSetting']().then((res) => {
            if (res) {
              res.settings.forEach((a) => {
                if (a.key === 'systemModel') {
                  this.flag = a.value
                }
              })
              userLoginSign = res.userLoginSign
              if (this.flag === 'systemModel2' && userLoginSign === false) {
                this.$router.push('/Maintain')
              } else {
                this.isLoginning = true
                // 将登录状态存入vuex
                this.$store.dispatch('setLoginState', this.keepLoggedIn)
                this.$store
                  .dispatch('userLogin', { ...this.loginForm })
                  .then((res) => {
                    if (!res) {
                      this.$router.push('/Maintain')
                    } else {
                      this.$router.push('/dash')
                      setTimeout(() => {
                        Notification.success({
                          title: '欢迎',
                          message: this.dayTime + '好，欢迎回来！',
                          type: 'success',
                          offset: 40
                        })
                      }, 100)
                    }
                  })
                  .finally(() => {
                    this.isLoginning = false
                  })
              }
            } else {
              return false
            }
          })
        } else {
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    // 校验系统是否维护模式  CA校验
    loginCheckCA() {
      let uploadFileJson = []
      // eslint-disable-next-line no-unused-vars
      let userLoginSign = true
      this.$api['SystemSettings.getLoginSetting']().then((res) => {
        if (res) {
          res.settings.forEach((a) => {
            if (a.key === 'systemModel') {
              this.flag = a.value
            }
            if (a.key === 'systemName') {
              if (a.value) {
                this.$store.dispatch('setSystemName', a.value)
                this.system_name = a.value
              } else {
                // eslint-disable-next-line no-undef
                this.$store.dispatch('setSystemName', this.systemNames)
                // eslint-disable-next-line no-undef
                this.system_name = this.systemNames
              }
            }
          })
          uploadFileJson = res.uploadFileJson
          if (uploadFileJson && uploadFileJson[0]) {
            const that = this
            uploadFileJson.map((item) => {
              if (item.id) {
                this.$api['SystemSettings.downloadLoginLogo']({ attachmentId: item.id }, { responseType: 'blob' }).then(function (res) {
                  item.filePath = window.URL.createObjectURL(new Blob([res.data]))
                  that.$nextTick(() => {
                    that.$refs.loginLogo.style.backgroundImage = `url(${item.filePath})`
                    that.$refs.loginLogo.style.backgroundRepeat = `no-repeat`
                  })
                })
              }
            })
          } else {
            // this.$refs.loginLogo.style.background = `url(../../assets/image/login/logo.png) no-repeat`
          }
          userLoginSign = res.userLoginSign
          if (userLoginSign === false) {
            this.$router.push('/Maintain')
          } else {
            this.isLoginning = true
            // 将登录状态存入vuex
            this.$store.dispatch('setLoginState', this.keepLoggedIn)
            this.$store
              .dispatch('userLogin', { ...this.loginForm })
              .then((res) => {
                if (!res) {
                  this.$router.push('/Maintain')
                } else {
                  this.$router.push('/dash')
                  setTimeout(() => {
                    Notification.success({
                      title: '欢迎',
                      message: this.dayTime + '好，欢迎回来！',
                      type: 'success',
                      offset: 40
                    })
                  }, 100)
                }
              })
              .finally(() => {
                this.isLoginning = false
              })
          }
        } else {
          return false
        }
      })
    },
    // 密码框登录
    loginCheck() {
      this.$api['SystemSettings.getLoginSetting']().then((res) => {
        if (res) {
          res.settings.forEach((a) => {
            if (a.key === 'systemName') {
              if (a.value) {
                this.$store.dispatch('setSystemName', a.value)
                this.system_name = a.value
              } else {
                // eslint-disable-next-line no-undef
                this.$store.dispatch('setSystemName', this.systemNames)
                // eslint-disable-next-line no-undef
                this.system_name = this.systemNames
              }
            }
          })
          const uploadFileJson = res.uploadFileJson
          if (uploadFileJson && uploadFileJson[0]) {
            const that = this
            uploadFileJson.map((item) => {
              if (item.id) {
                this.$api['SystemSettings.downloadLoginLogo']({ attachmentId: item.id }, { responseType: 'blob' }).then(function (res) {
                  item.filePath = window.URL.createObjectURL(new Blob([res.data]))
                  that.$nextTick(() => {
                    that.$refs.loginLogo.style.backgroundImage = `url(${item.filePath})`
                    that.$refs.loginLogo.style.backgroundRepeat = `no-repeat`
                  })
                })
              }
            })
          } else {
            // this.$refs.loginLogo.style.background = 'url(../../assets/image/login/logo.png) no-repeat'
          }
        }
      })
    }
  },
  components: {
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-checkbox': Checkbox,
    'el-button': Button
  }
}
</script>

<style lang="scss" scoped>
$login-bg-color: #112c79;
//$login-primary-color: #102B78;
$login-primary-color: $base-light-color;
$login-primary--login-color: #306cf7;

.main ::v-deep {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // background: linear-gradient(#0169ac, #0093bf);
  background: white;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-size: 100%;

  .login-wrapper {
    // position: absolute;
    height: 100%;
    width: 50%;
    background-position: center 0;
    background-repeat: no-repeat;
    background-size: cover;
    // transition: opacity .5s ease-in-out;
    background-image: url(../../assets/image/login/new_login_bic.png);
    // opacity: 1;

    .login-block {
      position: absolute;
      right: 25%;
      top: 50%;
      margin-right: -210px;
      margin-top: -220px;
      width: 420px;
      height: 440px;
      background: $base-white-color;
      // box-shadow: 0px 1px 5px 0px #6f7dff;
      border-radius: 1px;

      .login-contain {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        .login-logo {
          width: 150px;
          height: 96px;
          display: block;
          margin: 0 auto;
          background: url(../../assets/image/login/new_logo.png) no-repeat;
          background-size: contain;
          background-position: center;
          margin-top: 25px;
        }

        .login-sysName {
          font-size: 34px;
          font-family: Source Han Sans CN;
          color: #1f1f1f;
          text-align: center;
          margin-top: 5px;
          margin-bottom: 30px;
        }

        .loginForm {
          margin: 0 auto;
          width: 86%;
          .el-loading-spinner {
            margin-top: 30px;
            i {
              font-size: 70px;
            }
            .el-loading-text {
              font-size: 16px;
            }
          }
        }

        // .login-input {
        //   width: 100%;
        //   height: 40px;
        //   input {
        //     // border: 2px solid #306cf7;
        //     border-radius: 4px;
        //   }
        // }

        .login-button {
          width: 100%;
          height: 40px;
          padding: 5px 0px;
          // border: 2px solid darken($login-primary--login-color, 10%);
          border-radius: 4px;
          background: darken($login-primary--login-color, 10%);
          color: $base-white-color;
          font-size: 14px;
        }

        .el-checkbox__inner {
          border: 1px solid darken($login-primary--login-color, 10%);
        }

        .el-checkbox__input.is-checked .el-checkbox__inner {
          background-color: darken($login-primary--login-color, 10%);
        }

        .el-checkbox__input.is-checked + .el-checkbox__label {
          color: darken($login-primary--login-color, 10%);
        }

        .el-input--small .el-input__inner {
          height: 40px;
          line-height: 36px;
          border-radius: 4px;
        }
        .el-form-item--small.el-form-item {
          margin-bottom: 18px;

          &.userPassword,
          &.keepLoggedIn {
            margin-bottom: 10px;
          }
        }
        @media screen and (max-width: 1024px) {
          .el-input--small .el-input__inner {
            height: 30px;
            line-height: 30px;
            border-radius: 4px;
          }
          .el-form-item--small.el-form-item {
            margin-bottom: 14px;

            &.userPassword,
            &.keepLoggedIn {
              margin-bottom: 10px;
            }
          }
        }
        @media screen and (min-width: 1025px) and (max-width: 1280px) {
          .el-input--small .el-input__inner {
            height: 32px;
            line-height: 32px;
            border-radius: 4px;
          }
          .el-form-item--small.el-form-item {
            margin-bottom: 16px;

            &.userPassword,
            &.keepLoggedIn {
              margin-bottom: 10px;
            }
          }
        }
        @media screen and (min-width: 1281px) and (max-width: 1440px) {
          .el-input--small .el-input__inner {
            height: 36px;
            line-height: 36px;
            border-radius: 4px;
          }
          .el-form-item--small.el-form-item {
            margin-bottom: 18px;

            &.userPassword,
            &.keepLoggedIn {
              margin-bottom: 10px;
            }
          }
        }
      }
    }

    @media screen and (max-width: 1024px) {
      .login-block {
        margin-right: -155px;
        margin-top: -225px;
        width: 310px;
        height: 330px;

        .login-contain {
          .login-logo {
            width: 100px;
            height: 64px;
            margin-top: 15px;
            background-size: contain;
          }

          .login-sysName {
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 18px;
          }

          .loginForm {
            width: 86%;
          }

          // .login-input {
          //   height: 30px;
          //   input {
          //     // border: 2px solid darken($login-primary--login-color, 10%);
          //     border-radius: 4px;
          //   }
          // }

          .login-button {
            height: 30px;
            // border: 2px solid darken($login-primary--login-color, 10%);
            border-radius: 4px;
            font-size: 12px;
          }
        }
      }
    }

    @media screen and (min-width: 1025px) and (max-width: 1280px) {
      .login-block {
        margin-right: -170px;
        margin-top: -182px;
        width: 340px;
        height: 364px;

        .login-contain {
          .login-logo {
            width: 120px;
            height: 76px;
            margin-top: 15px;
            background-size: contain;
          }

          .login-sysName {
            font-size: 26px;
            margin-bottom: 20px;
          }

          .loginForm {
            width: 86%;
          }

          // .login-input {
          //   height: 32px;
          //   input {
          //     border: 2px solid darken($login-primary--login-color, 10%);
          //     border-radius: 16px;
          //   }
          // }

          .login-button {
            height: 32px;
            // border: 2px solid darken($login-primary--login-color, 10%);
            border-radius: 4px;
            font-size: 14px;
          }
        }
      }
    }

    @media screen and (min-width: 1281px) and (max-width: 1440px) {
      .login-block {
        margin-right: -192px;
        margin-top: -207px;
        width: 384px;
        height: 414px;

        .login-contain {
          .login-logo {
            width: 140px;
            height: 90px;
            margin-top: 20px;
            background-size: contain;
          }

          .login-sysName {
            font-size: 30px;
            margin-bottom: 30px;
          }

          .loginForm {
            width: 86%;
          }

          // .login-input {
          //   height: 36px;
          //   input {
          //     border: 2px solid darken($login-primary--login-color, 10%);
          //     border-radius: 18px;
          //   }
          // }

          .login-button {
            height: 36px;
            // border: 2px solid darken($login-primary--login-color, 10%);
            border-radius: 4px;
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
