Page({
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
    canvasContext: '',
    hats: []
  },

  onLoad: function (options) {
    this.setData({ canvasContext: wx.createCanvasContext('canvas') });
    this._getHats();
  },

  // 获取帽子列表
  async _getHats() {
    let res = await wx.cloud.database().collection('hatList').where({ status: 1 }).get();
    // console.log(res);
    if (res.data && res.data.length != 0) {
      this.setData({ hats: res.data });
    }
  },

  // 画布
  async _useCanvas(url, x = 0, y = 0, w = 412, h = 412) {
    this.setData({ canvasContext: wx.createCanvasContext('canvas') });
    let dw = 375;
    await wx.getSystemInfo({
      success(res) {
        dw = res.safeArea.width;
      }
    })
    // 根据屏幕尺寸计算图片的px值
    let rpx = dw / 750;
    let pw = w * rpx;
    let ph = h * rpx;

    this.data.canvasContext.beginPath();
    this.data.canvasContext.drawImage(url, x, y, pw, ph)
    this.data.canvasContext.draw(true);
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

  // 保存结果
  _saveResult() {
    this.data.canvasContext.drawImage('', -1, -1, 0, 0)
    this.data.canvasContext.draw(true, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          x: 0, y: 0,
          width: 412,
          height: 412,
          destWidth: 412,
          destHeight: 412,
          canvasId: 'canvas',
          fileType: 'jpg',
          quality: 1,
          success: (res) => {
            this.uuuurl = res.tempFilePath;
            console.log(res.tempFilePath);
            if (res.tempFilePath) {
              wx.showToast({
                title: '图片下载到' + res.tempFilePath,
              })
            }
          },
          fail(res) {
            console.log(res, 'fail');
          }
        })
      }, 1000)
    });
  },


  // 获取头像并调用canvas函数将头像画在画布中
  _getUserInfo(e) {
    // console.log(e.detail.userInfo, 111);
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo,
        headPic: e.detail.userInfo.avatarUrl,
        hasUploadHeadpic: 1
      });
      console.log(this.data.headPic);
      wx.getImageInfo({
        src: this.data.headPic,
        success: (res) => {
          console.log(res);
          this._useCanvas(res.path);//参数为头像的路径
        }
      })
    } else {
      wx.showToast({
        title: '头像上传失败，请重新上传',
        icon: 'none'
      })
    }
  },



  // 画帽子
  _drawHat(e) {
    wx.getImageInfo({
      src: e.currentTarget.dataset.path,
      success: (res) => {
        this._useCanvas(res.path, 60, -8, 200, 200);//参数为头像的路径
      }
    })
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