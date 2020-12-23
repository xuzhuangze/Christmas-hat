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
    downloadPath: '',
    headPic: '',
    hasUploadHeadpic: 0,
    canvasContext: '',
    hats: [],
    canDrawHat: false,
    headtemppath: '',
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
  async _useCanvas(url, x = 0, y = 0, w = 412, h = 412, isclear) {
    this.setData({ canvasContext: wx.createCanvasContext('canvas') });
    let dw = 375;
    await wx.getSystemInfo({
      success(res) {
        dw = res.safeArea.width;
      }
    })
    // 根据屏幕尺寸计算图片的px值
    let rpx = dw / 750;
    let headw = 412 * rpx;
    let headh = 412 * rpx;
    let pw = w * rpx;
    let ph = h * rpx;


    if (isclear) {//是否需要清空canvas（这里直接再画了个把原来的内容覆盖掉）
      this.data.canvasContext.beginPath();
      this.data.canvasContext.drawImage(this.data.headtemppath, 0, 0, headw, headh)
      this.data.canvasContext.draw();
    }

    this.data.canvasContext.beginPath();
    this.data.canvasContext.drawImage(url, x, y, pw, ph)
    this.data.canvasContext.draw(true);
  },



  // 保存结果
  _saveResult() {
    this.data.canvasContext.drawImage('../../static/images/transparent.png', -1, -1, 0, 0)
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
            if (res.tempFilePath) {
              this.setData({
                downloadPath: res.tempFilePath
              });
              console.log(res.tempFilePath);
              wx.showToast({
                title: '图片下载到' + res.tempFilePath,
                icon: 'none'
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
          this.setData({ canDrawHat: true, headtemppath: res.path })
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
    if (!this.data.canDrawHat) {
      wx.showToast({
        title: '请上传头像！',
        icon: 'none'
      })
      return
    }
    // this.data.canvasContext.fillStyle = 'transparent';


    wx.getImageInfo({
      src: e.currentTarget.dataset.path,
      success: (res) => {
        this._useCanvas(res.path, 60, 0, 200, 200, 1);//参数为头像的路径
      }
    })
  },

})