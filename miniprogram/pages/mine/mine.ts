// pages/mine/mine.ts
Page({
  logout() {
    wx.removeStorageSync('token')
    wx.reLaunch({ url: '/pages/login/login' })
  }
})