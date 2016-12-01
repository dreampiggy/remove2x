# Introduce
> remove2x 可以批量扫描指定的路径下（一般为Xcode工程路径），同时含有3x和2x图的所有的imageset，并备份，恢复，删除多余的2x图并处理对应Contents.json文件。

> remove2x can scan and backup/recovery/delete @2x image file in imageset which contains both @2x & @3x image. Also deal with Contents.json file.
> 

@1x设备如今已经基本没有，`~ipad`图和`LaunchImage`不会处理。通过删除@2x图，能显著减少iOS App包大小。处理后理论上不会引入运行时异常，同时对于使用`[UIImage imageNamed:]`来处理的本地图片，Runtime本身有缓存机制，运行时缩放的开销较小。但如果对于部分边缘平滑图，@3x的缩放效果可能不够理想，手动恢复对应备份即可。

@1x devices, `~ipad` image and `LaunchImage` file will not process. This tool is good for reduce iOS App bundle size. Because it just process the imageset files, which will not cause runtime error. For those use `[UIImage imageNamed:]` to load local image file, Runtime can cache the shirnked image the first time load to RAM. For some smooth-edge @3x images which is not good after shrinking, it's better to manural recovery the backup.

# Require

nodejs（v4.0 and higher）：

```shell
brew install node
```

# Usage


+ 扫描并备份指定目录下，所有同时含有@2x图和@3x图的imageset中，对应的@2x图和Contents.json。备份后缀名为`.2xbak`
+ Scan and backup the @2x image and Contents.json file in the provided folder where the imageset contains both @2x & @3x images.The extension name is `.2xbak`

```shell
node removejs ./
```

+ 恢复备份过的@2x图片（需要先执行备份）
+ Recovery the backed @2x image and Contents.json file(need to backup before)

```shell
node removejs ./ --recovery
```

+ 删除所有备份过的@2x图片（需要先执行备份）
+ Delete all the backed @2x image and Contets.json files(need to backup before)

```shell
node removejs ./ --delete
```