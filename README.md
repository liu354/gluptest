> 参考http://www.alloyteam.com/2016/01/9918/#comments 
> 但这位大兄弟的代码跑不起呀、自己简单修改了下
> http://nodejs.cn/api/fs.html node官网
> https://www.gulpjs.com.cn/docs/api/ glup官网
> 结合以上思考对理解glup的思想更有帮助

# 目的
将最终生成的资源文件／地址注入到HTML中
# 如何注入
- 获取所有的js/css资源
- 获取所有的HTML文件
- 定位HTML中的依赖声明
- 匹配所依赖的资源
- 生成并注入依赖的资源标签

# 遇到的问题
pipe是异步进行的，导致html文件会提前生成
### 解决
当然是使用 `Promise`啦
```
function getResources(done) {
        return new Promise((resolve, reject) => {
            resourcesStream.pipe(mapStream(function (data, cb) {
                    resources.push(data);
                    cb(null, data)
                }))
                .on('end', function () {
                    done(resources);
                    resolve();
                })
                .on('error', function () {
                    reject();
                })
        })
    }
```
```
getResources(function (list) {
            //获取HTML中的资源依赖声明
            html = html.replace(depRegexp, function (expr, fileRegexpStr) {
                var fileRegexp = new RegExp(fileRegexpStr); //获取匹配js、css文件的正则表达式
                //获取匹配的依赖
                var deps = matchingDependences(list, fileRegexp);
                //文件对象转换为HTML标签
                return transform(deps);
            });
        }).then(
            (res) => {
                // html文件对象
                data.contents = new Buffer(html)
                cb(null, data);
            }
        )
```

还有就是map-stream到底给我们返回了什么？
它不同于Vinyl和stream.Readable 类，想知道的可自行打印看看

# 总结
在 gulp 的任务中，gulp.src 接口将匹配到的文件转化为可读（或 Duplex/Transform）流，通过 .pipe 流经各插件进行处理，最终推送给 gulp.dest 所生成的可写（或 Duplex/Transform）流并生成文件