# Preact 分享

## preact
>优点 gzip压缩之后只有3k, 3k, 3k... 配合简单的webpack和简单的路由就可独立完成一个单入口应用.语法和react基本一样,效率高.

```
//安装
npm install preact
//主页
npm home preact
```
xueba cdn地址 :
[http://static.xueba100.com/public/preact/latest/dist/preact.min.js](http://static.xueba100.com/public/preact/latest/dist/preact.min.js)

与react的差别:
* 需依赖JSX编译Virtual DOM
* 移除PropType属性
* 只支持ES6语法
* 移除renderhtml
* 等等

## webpack
基本思想:一切皆require  
例子:参考注释

```js
module.exports = {
  entry: {
    app:APP_PATH+'/main.js',//入口文件build的时候<他>及<他require的>及<他require的require的>都会打包成一个js
  },
  output: {
    path: BUILD_PATH,//build文件的路径
    filename: ENV==='production'?'[name].[hash:8].js':'[name].js',//build文件的名字
    chunkFilename:ENV==='production'?'[id].[chunkhash:8].js':'[id].js',//非直接require(例如异步require的)js
    publicPath: __PUBLIC__,//在所有引用路径前加上publicPath,例如cdn全路径的运用
    // library: 'JSBridge', //需要打包成js库的可用此配置
    // libraryTarget: 'umd',
    // umdNamedDefine: true
  },
  module:{
    //!为loader语法的简写 从右往左依次处理
    loaders:[
      { test: /\.(css|less)?$/, loader: 'style!css-loader!less-loader' },
      {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
      },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=image/svg+xml' },
      { test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i, loader: 'url?limit=2000&name=[name].[hash:8].[ext]'+ (ENV==='production'?'!image-webpack':'')},
      { test: /\.json$/, loader: 'json' },
    ]
  },
  //压缩图片的插件
  imageWebpackLoader: {
    progressive:true,
    optimizationLevel: 7,
    interlaced: false,
    pngquant:{
      quality: "65-90",
      speed: 4
    },
    svgo:{
      plugins: [
        {
          removeViewBox: false
        },
        {
          removeEmptyAttrs: false
        }
      ]
    }
  },
  //本地测试服务器
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    colors: true,
    host:'0.0.0.0',
    proxy: {
     '*': {//防跨域代理,bypass就是可以拦截请求用nodejs的语法来自己mock数据
         changeOrigin: true,
         target: 'http://qa01-bbl.xuebadev.com',
         secure: false,
        //  bypass: function(req, res, proxyOptions) {
        //     res.writeHead(200, {'Content-type' : 'text/json'});
        //     res.write(JSON.stringify({name:1}));
        //     return false;
        //  }
     }
   }
  },
  plugins: ([
    new HtmlwebpackPlugin({//有的项目不只是js文件,需要html入口,此插件通过一个html模板自动生成html并把编译后app.js注入进去
      title: '高中数学综合实践活动',
      template: APP_PATH+'/html.ejs',
      minify: { collapseWhitespace: true }
    }),
    new webpack.DefinePlugin({//把一些全局常量放到这里,可以在代码了直接用
      __DEV__: ENV==='production'?false:true,
    }),
    // new OfflinePlugin(),//Application Cache插件(慎用)
	]).concat(ENV==='production' ? [
    new webpack.optimize.UglifyJsPlugin(),//一些压缩优化插件
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
	] : [
  ]),
  stats: { colors: true },

};
```

## 路由

通过location.hash自定义自己的路由规则,监听window.onhashchange事件通过react的this.setState方法把require.ensure异步加载进来的page直接挂载到根Component上(有兴趣的可以自定义转场效果仿真原生App)
## react基本原理
* Virtual DOM:

```js
//把dom抽象成object
var dom={
  type:'div',
  props:{id:'d1',class:'d1'},
  children:
    [
      {
        type:'p',
        props:{id:'p1',class:'p1'},
        children:'xxx'
      },
      {
        type:'a',
        props:{id:'a1',class:'a1'},
        children:'xxx'
      },
    ]
  }
//这样看着太麻烦,所以实现一个类似h()的辅助函数
function h(type,props,children_arr){
  return {type:type,props:props,children:children_arr}
}
//改造为
var dom=h(
  'div',
  {id:'d1',class:'d1'},
  [
    h('p',{id:'p1',class:'p1'},'xxx'),
    h('a',{id:'a1',class:'a1'},'xxx'),
  ]
)
```

* diff算法  
dom操作效率最低,通过比较虚拟dom对象来diff出需要改变的那部分就行了  
object递归比较复杂度太高,简化为三步比较极大降低复杂度  
1.逐层比较,(一般dom很少发生夸层级移动节点,如有这种情况干脆直接重建好了)复用原来的dom对象,所以为了提高效率尽量不要让dom层级发生变化,用class的显示和隐藏来代替切换dom能提示效率  
2.Component比较,发现Component变了就直接不用往下比较了  
3.针对类似list这种很多元素循环的比较,强制加入唯一key机制,直接比较渲染前后key相同的元素,如obj===obj直接复用
* 优化
每次setState都会调用render,所以不要把复杂逻辑处理写到render方法里面.shouldComponentUpdate的运用

## 简化实现的MyRedux
思想:把数据模型抽离成一个store树,统一管理,然后通过dispatch分发处理store的各自分支来控制数据变化  
优化:在包装react的Component通过shouldComponentUpdate脏值比较来阻断无效的向子组件传递的重渲染
```js
//主要实现了5个接口
//1.constructor  把自定义的reducer传人MyRedux构架store数据
const reducer={
  user(state = {data:{},isJoin:false,ispraise:false}, {type,...newState}) {
    if(type=='user'){
      return {...state,...newState};
    }
    return state;
  },
  form(state={name:'',age:''},{type,...newState}){
    if(type=='form'){
      return {...state,...newState};
    }
    if(type=='foo'){
      return {...state,{foo:'foo'}};
    }
    if(type=='bar'){
      return {...state,{bar:'bar'}};
    }
    return state;
  }
}
//其实就是依次执行reducer.user({}),reducer.form({})最后把返回的默认state合并到store树上

//2.dispatch  还是依次执行reducer.user(store.user,{data:'data',type:'foo'}),reducer.form(store.form,{data:'data',type:'foo'})
dispatch({data:'data',type:'foo'})
//dispatch(type=='foo')的逻辑修改此分支的state

//3.subscribe 传人一个函数,每次dispatch的时候执行这个关注函数
unsubscribe=subscribe(function() {
  console.log('log');
})
unsubscribe()//执行unsubscribe()取消关注回收释放

//4.getState() //拿到现在的store树
const data=getState()

//5.connect 与react连接,在自定义的Component外边包装一层Component并把需要关注分枝state注入到props里面.
//通过subscribe关注注入分枝的数据变化用<包装Component>的this.setState()的方法去重新render改变props
//这样自己实现的Component就会被重新渲染并且porps值变成最新的.
//这样无论自己实现的Component在什么层级中,只要他关注的state分枝通过dispatch改变,那么他就会重新渲染
//实现了旁系组件之间传值得问题
const newMyComponent=connect(function(store_data) {
  return {
    user:store_data.user//此处返回此Component需要关注的store_data分枝的state
  }
})(MyComponent)
```

## node-git
在测试服务器上面跑一个httpserver,通过get请求的参数在测试服务器上执行基本的更新命令  
可以直接点击链接或者copy下来curl命令集成到自己的构架命令里面  
方便更新测试服务器代码  
[node-git链接](http://10.2.1.22:9923/)
