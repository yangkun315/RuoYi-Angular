/**
 * RuoYi 后端代理配置
 * /dev-api -> http://localhost:8080
 *
 * /assets 不走代理，由 dev server 直接提供静态资源
 * ECONNREFUSED 错误：表示 RuoYi 后端未启动。
 */
module.exports = {
  '/assets': {
    bypass: () => false
  },
  '/dev-api': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/dev-api': '' }
  }
};
