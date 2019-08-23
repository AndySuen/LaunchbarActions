function translate(argument) {
    var sourceLang = 'auto'
    var targetLang = 'zh-CN'
    var ICON = 'Google_Translate_Icon.png'
    if (!/[a-zA-Z]/.test(argument)) {
        sourceLang = 'auto'
        targetLang = 'en'
    }

    function splitLongSentence(s) {
        var re = /[^，；。？！]+[，；。？！]+/g;
        if (targetLang == 'en') {
            re = /[^,;\.\?!]+[,;\.\?!]+/g;
        }
        if (re.test(s.slice(0, -1))) {
            var ls = s.match(re);
            var tmp = []
            for (let w of ls) {
                if (tmp.length && (tmp[tmp.length - 1] + w).length <= 40) {
                    tmp[tmp.length - 1] = tmp[tmp.length - 1] + w
                } else {
                    tmp.push(w)
                }
            }
            ls = tmp
            var children = ls.filter(x => x.length).map(x => ({ title: x, subtitle: x }));
            return children;
        }
        return [];
    }

    // dt 跟 ie 参数很重要
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
        sourceLang + "&tl=" + targetLang + "&dt=t&dt=bd&ie=UTF-8&q="
    var result = HTTP.getJSON(url + encodeURIComponent(argument));

    if (result == undefined) {
        LaunchBar.alert('HTTP.getJSON() returned undefined');
        return [];
    }

    if (result.error != undefined) {
        LaunchBar.log('Error in HTTP request: ' + result.error);
        return [];
    }

    result = result.data

    var suggestions = []

    try {
        if (result && result[0] && result[0][0] && result[0][0][0]) {
            if (!result[1]) {
                var title = result[0][0][0];
                var subtitle = result[0][0][1];
                var item = {
                    title: title,
                    subtitle: subtitle,
                    icon: ICON
                }
                var children = splitLongSentence(title);
                if (children.length) { item['children'] = children; }
                suggestions.push(item);
            }
            result[0].forEach(function(r, i) {
                if (i == 0) return
                if (Array.isArray(r) && r[0]) {
                    var title = r[0];
                    var subtitle = r[1];
                    var item = {
                        title: title,
                        subtitle: subtitle,
                        icon: ICON
                    }
                    var children = splitLongSentence(title);
                    if (children.length) { item['children'] = children; }
                    suggestions.push(item);
                }
            })

            if (Array.isArray(result[1]) && Array.isArray(result[1][0]) && Array.isArray(result[1][0][1])) {
                result[1][0][1].forEach(function(t) {
                    var title = t;
                    var subtitle = t;
                    var item = {
                        title: title,
                        subtitle: subtitle,
                        icon: ICON
                    }
                    var children = splitLongSentence(title);
                    if (children.length) { item['children'] = children; }
                    suggestions.push(item);
                })
            }
        }
    } catch (e) {
        LaunchBar.alert(e.message)
    }

    return suggestions
}
