const mapStream = require('map-stream');
var path = require('path');

function InjectResources(resourcesStream) {
    var resources = [] //存放js、css资源
    if (resources.length !== 0) return;
    //处理js、css
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

    function matchingDependences(list, regexp) {
        var deps = [];
        list.forEach(file => {
            var fpath = file.path;
            if (regexp.test(fpath)) {
                deps.push(file);
            }
        });
        return deps;
    }

    function transform(deps) {
        var data = '';
        deps.forEach(function (dep) {
            var ext = path.extname(dep.path);
            switch (ext) {
                case '.js':
                    data = `\n<script>\n${ dep._contents || ''}\n</script>`
                    break;
                case '.css':
                    data = '<link rel="stylesheet" href="' + dep.history + '">'
                    break
            }

        })
        return data;
    }

    //获取当前流中的所有目标HTML文件
    return mapStream(function (data, cb) {
        var html = data.contents.toString();
        var depRegexp = /<!--InlineResource:(.*?)-->/g;
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
    });

}
module.exports = InjectResources;