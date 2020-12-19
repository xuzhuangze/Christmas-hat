// const db = wx.cloud.database();
// const findByWhere = (table, where) => {
//   return db.collection(table).where(where).get();
// }
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    ctx: '',
    // bgUrl: '../../static/images/hat/hat01.jpg',
    hat: {
      url: "../../static/images/hat/hat01.jpg",
      w: 40,
      h: 40,
      x: 100,
      y: 100,
      b: 1,//缩放的倍率
      rotate: 0//旋转的角度
    },
    uuuurl: '',
    headPic: '',
    hasUploadHeadpic: 0,
    OffscreenCanvas: '',
    canvasContext: '',
    hats: []
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getHats();
    this.setData({ OffscreenCanvas: wx.createOffscreenCanvas() });
    this.setData({ canvasContext: wx.createCanvasContext('canvas', this.data.OffscreenCanvas) });
  },
  async _getHats() {
    let res = await wx.cloud.database().collection('hatList').where({ status: 1 }).get();
    console.log(res);
    if (res.data && res.data.length != 0) {
      this.setData({ hats: res.data });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },


  async _useCanvas(url) {
    let dw = 375;
    await wx.getSystemInfo({
      success(res) {
        console.log(res.safeArea.width);
        dw = res.safeArea.width;
      }
    })
    // 根据屏幕尺寸计算图片的px值
    let rpx = dw / 750;
    let pw = 412 * rpx;
    let ph = 412 * rpx;
    console.log(pw, 'pw');
    console.log(ph, 'ph');

    this.data.canvasContext.drawImage(url, 0, 0, pw, ph)
    this.data.canvasContext.draw();
    // this.data.canvasContext.draw(true, () => { 
    //   setTimeout(() => {
    //     wx.canvasToTempFilePath({
    //       x: 0, y: 0,
    //       width: 412,
    //       height: 412,
    //       destWidth: 412,
    //       destHeight: 412,
    //       canvasId: 'canvas',
    //       fileType: 'jpg',
    //       quality: 1,
    //       success: (res) => {
    //         this.uuuurl = res.tempFilePath;
    //         console.log(res.tempFilePath);
    //       },
    //       fail(res) {
    //         console.log(res, 'fail');
    //       }
    //     })
    //   }, 1000)
    // });
  },



  // 获取头像并调用canvas函数将头像画在画布中
  _getUserInfo(e) {
    console.log(e.detail.userInfo, 111);
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo,
        headPic: e.detail.userInfo.avatarUrl,
        hasUploadHeadpic: 1
      });
      wx.downloadFile({
        url: this.data.headPic,
        success: (res) => {
          console.log(res);
          this._useCanvas(res.tempFilePath);//参数为头像的路径
        }
      })
    } else {
      wx.showToast({
        title: '头像上传失败，请重新上传',
        icon: 'none'
      })
    }
  },




  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})