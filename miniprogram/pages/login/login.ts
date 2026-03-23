Page({
  data: {
    phone: '', // 手机号
    pwd: ''    // 密码
  },

  // 手机号输入事件
  onPhoneInput(e: any) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 密码输入事件
  onPwdInput(e: any) {
    this.setData({
      pwd: e.detail.value
    })
  },

  // 登录按钮点击
  onLogin() {
    const { phone, pwd } = this.data
    // 简单校验
    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }
    if (!pwd) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }
    // 模拟登录成功
    wx.showToast({ title: '登录成功' })
    // 登录成功后跳转到首页
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' })
    }, 1500)
  },

  // 忘记密码点击事件
  goForgetPwd() {
    wx.showToast({ title: '跳转到找回密码页面', icon: 'none' })
    // 实际项目中可以跳转到忘记密码页面：
    // wx.navigateTo({ url: '/pages/forget-pwd/forget-pwd' })
  }
})