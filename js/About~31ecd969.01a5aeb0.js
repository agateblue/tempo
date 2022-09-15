(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["About~31ecd969"],{"1f4f":function(e,t,a){"use strict";var s=a("5530"),o=(a("a9e3"),a("8b37"),a("80d2")),i=a("7560"),r=a("58df");t["a"]=Object(r["a"])(i["a"]).extend({name:"v-simple-table",props:{dense:Boolean,fixedHeader:Boolean,height:[Number,String]},computed:{classes:function(){return Object(s["a"])({"v-data-table--dense":this.dense,"v-data-table--fixed-height":!!this.height&&!this.fixedHeader,"v-data-table--fixed-header":this.fixedHeader,"v-data-table--has-top":!!this.$slots.top,"v-data-table--has-bottom":!!this.$slots.bottom},this.themeClasses)}},methods:{genWrapper:function(){return this.$slots.wrapper||this.$createElement("div",{staticClass:"v-data-table__wrapper",style:{height:Object(o["g"])(this.height)}},[this.$createElement("table",this.$slots.default)])}},render:function(e){return e("div",{staticClass:"v-data-table",class:this.classes},[this.$slots.top,this.genWrapper(),this.$slots.bottom])}})},"615b":function(e,t,a){},"8b37":function(e,t,a){},"99d9":function(e,t,a){"use strict";a.d(t,"a",(function(){return i})),a.d(t,"b",(function(){return n})),a.d(t,"c",(function(){return d}));var s=a("b0af"),o=a("80d2"),i=Object(o["i"])("v-card__actions"),r=Object(o["i"])("v-card__subtitle"),n=Object(o["i"])("v-card__text"),d=Object(o["i"])("v-card__title");s["a"]},b0af:function(e,t,a){"use strict";var s=a("5530"),o=(a("a9e3"),a("0481"),a("4069"),a("615b"),a("10d2")),i=a("297c"),r=a("1c87"),n=a("58df");t["a"]=Object(n["a"])(i["a"],r["a"],o["a"]).extend({name:"v-card",props:{flat:Boolean,hover:Boolean,img:String,link:Boolean,loaderHeight:{type:[Number,String],default:4},raised:Boolean},computed:{classes:function(){return Object(s["a"])(Object(s["a"])({"v-card":!0},r["a"].options.computed.classes.call(this)),{},{"v-card--flat":this.flat,"v-card--hover":this.hover,"v-card--link":this.isClickable,"v-card--loading":this.loading,"v-card--disabled":this.disabled,"v-card--raised":this.raised},o["a"].options.computed.classes.call(this))},styles:function(){var e=Object(s["a"])({},o["a"].options.computed.styles.call(this));return this.img&&(e.background='url("'.concat(this.img,'") center center / cover no-repeat')),e}},methods:{genProgress:function(){var e=i["a"].options.methods.genProgress.call(this);return e?this.$createElement("div",{staticClass:"v-card__progress",key:"progress"},[e]):null}},render:function(e){var t=this.generateRouteLink(),a=t.tag,s=t.data;return s.style=this.styles,this.isClickable&&(s.attrs=s.attrs||{},s.attrs.tabindex=0),e(a,this.setBackgroundColor(this.color,s),[this.genProgress(),this.$slots.default])}})},f820:function(e,t,a){"use strict";a.r(t);var s=a("b0af"),o=a("99d9"),i=a("1f4f"),r=function(){var e=this,t=e._self._c;return t("div",[t(s["a"],{staticClass:"mb-8",attrs:{tag:"section",color:e.$theme.card.color}},[t(o["c"],{staticClass:"headline"},[e._v("About Tempo")]),t(o["b"],{class:e.$theme.card.textSize},[t("p",[e._v(" Tempo is a personnal log and mood tracker. You can use it to track what's going on in your life and how different events affect your well-being. ")])])],1),t(s["a"],{staticClass:"mb-8",attrs:{tag:"section",color:e.$theme.card.color}},[t(o["c"],{staticClass:"headline"},[e._v("Features")]),t(o["b"],{class:e.$theme.card.textSize},[t("ul",[t("li",[t("a",{attrs:{href:"#private"}},[e._v("Private by design")])]),t("li",[t("a",{attrs:{href:"#offline"}},[e._v("Offline first")])]),t("li",[t("a",{attrs:{href:"#mood-tracking"}},[e._v("Mood tracking")])]),t("li",[t("a",{attrs:{href:"#search"}},[e._v("Powerful tagging and filtering")])]),t("li",[t("a",{attrs:{href:"#software"}},[e._v("Powered by free and open-source software")])])])])],1),t(s["a"],{staticClass:"mb-8",attrs:{tag:"section",color:e.$theme.card.color}},[t(o["c"],{staticClass:"headline"},[e._v("How does it work?")]),t(o["b"],{class:e.$theme.card.textSize},[t("p",[e._v(" Use Tempo as you would use a personnal log. Write notes when you feel like it, and use hashtags and moodtags to indicate how you feel. ")])])],1),t(s["a"],{staticClass:"mb-8",attrs:{tag:"section",color:e.$theme.card.color}},[t(o["c"],{staticClass:"headline"},[e._v("Where is the data stored?")]),t(o["b"],{class:e.$theme.card.textSize},[t("p",[e._v("The data never leaves your browser and isn't sent to any third-party or server. The only exception to that is when you enable (optional) syncing with other devices, through a CouchDB server of your choice.")]),t("p",[e._v("All your data can also be exported in JSON and Markdown format at any time.")])])],1),t(s["a"],{staticClass:"mb-8",attrs:{tag:"section",id:"offline",color:e.$theme.card.color}},[t(o["c"],{staticClass:"headline"},[e._v("Does it work offline?")]),t(o["b"],{class:e.$theme.card.textSize},[t("p",[e._v("Yes! Tempo is a Progressive Web App (PWA) and can be accessed and used even without an internet connection.")])])],1),t(s["a"],{staticClass:"mb-8",attrs:{tag:"section",color:e.$theme.card.color}},[t(o["c"],{staticClass:"headline"},[e._v("Hashtags")]),t(o["b"],{class:e.$theme.card.textSize},[t("p",[e._v(" While entirely optional, hashtags and moodtags can help you categorize your notes and track your moods. Here is a sample note using hashtags: ")]),t("blockquote",{staticClass:"blockquote"},[e._v(" Had a great day at "),t("a",{attrs:{href:""}},[e._v("#work!")])]),t("p",[e._v("Hashtags can help you to categorize your notes and search them later.")])])],1),t(s["a"],{staticClass:"mb-8",attrs:{tag:"section",id:"mood-tracking",color:e.$theme.card.color}},[t(o["c"],{staticClass:"headline"},[e._v("Moodtags")]),t(o["b"],{class:e.$theme.card.textSize},[t("p",[e._v("Moodtags work similarly, but allow you to associate a mood with a given word. For instance:")]),t("blockquote",{staticClass:"blockquote"},[e._v(" Stephanie and I had an argument. I feel "),t("a",{attrs:{href:""}},[e._v("--angry")]),e._v(" and "),t("a",{attrs:{href:""}},[e._v("-confused")]),e._v("… ")]),t("p",[e._v(" By using the "),t("code",[e._v("-")]),e._v(" tag, you indicate to Tempo that "),t("code",[e._v("angry")]),e._v(" and "),t("code",[e._v("confused")]),e._v(" are negative feelings. Similarly, you could use the "),t("code",[e._v("+")]),e._v(" tag in front of a word to indicate a positive feeling. You can repeat these signs up to three time to indicate a greater intensity. ")]),t("p",[e._v(" When present, "),t("code",[e._v("-")]),e._v(" and "),t("code",[e._v("+")]),e._v(" tags are used to compute the mood score of each note. This score is then used in the daily mood widget to track your moods over time. ")]),t("p",[e._v(" Each occurence of "),t("code",[e._v("-")]),e._v(" and "),t("code",[e._v("+")]),e._v(" in a note will decrease or increase the mood score by 1. ")]),t("p",[e._v(" There are a couple additional tags you can use, that don't affect the mood score, but can be useful regardless: ")]),t("ul",[t("li",[t("code",[e._v("~")]),e._v(": indicate mixed feelings")]),t("li",[t("code",[e._v("?")]),e._v(": indicate you don't know how you feel")]),t("li",[t("code",[e._v("!")]),e._v(": indicate that something is important")])]),t("p",[e._v(" You can freely mix any and all these tags in the same note, and use different moodtags with the same words. For instance: ")]),t("blockquote",{staticClass:"blockquote"},[e._v(" I hate insomnia, I'm feeling so "),t("a",{attrs:{href:""}},[e._v("---tired")]),e._v("… ")]),t("blockquote",{staticClass:"blockquote"},[e._v(" Had a good sport session this morning, I'm "),t("a",{attrs:{href:""}},[e._v("+tired")]),e._v(" but happy. ")])])],1),t(s["a"],{staticClass:"mb-8",attrs:{tag:"section",id:"search",color:e.$theme.card.color}},[t(o["c"],{staticClass:"headline"},[e._v("Search and filter notes")]),t(o["b"],{class:e.$theme.card.textSize},[t("p",[e._v(" The search bar let you filter notes that match your query. The daily mood widget is also updated accordingly. You can find some basic queries below: ")]),t(i["a"],{staticClass:"mb-2",scopedSlots:e._u([{key:"default",fn:function(){return[t("tbody",[t("tr",[t("td",[t("code",[e._v("sport")])]),t("td",[e._v(' Find all the entries containing the word "sport" ')])]),t("tr",[t("td",[t("code",[e._v("tag:sport")])]),t("td",[e._v(" Find all the entries tagged with sport ")])]),t("tr",[t("td",[t("code",[e._v("-sport")])]),t("td",[e._v(" Find all the entries tagged with -sport ")])]),t("tr",[t("td",[t("code",[e._v("@2020-09-17")])]),t("td",[e._v(" Find all the entries submitted on 2020-09-17 ")])]),t("tr",[t("td",[t("code",[e._v("@2020")])]),t("td",[e._v(" Find all the entries submitted during 2020 ")])]),t("tr",[t("td",[t("code",[e._v("@2020-08")])]),t("td",[e._v(" Find all the entries submitted during 2020-08 ")])]),t("tr",[t("td",[t("code",[e._v("+")])]),t("td",[e._v(" Find all entries with a positive moodtag (also works with "),t("code",[e._v("-")]),e._v(", "),t("code",[e._v("?")]),e._v(", "),t("code",[e._v("!")]),e._v(" and "),t("code",[e._v("~")]),e._v(") ")])]),t("tr",[t("td",[t("code",[e._v("is:fav")])]),t("td",[e._v(" Find favorited entries ")])]),t("tr",[t("td",[t("code",[e._v("is:thread")])]),t("td",[e._v(" Find first entry of a thread ")])]),t("tr",[t("td",[t("code",[e._v("is:reply")])]),t("td",[e._v(" Find replies to an entry ")])])])]},proxy:!0}])}),t("p",[e._v(" You can mix various parameters to further refine your results. Here are some more advanced queries: ")]),t(i["a"],{scopedSlots:e._u([{key:"default",fn:function(){return[t("tbody",[t("tr",[t("td",[t("code",[e._v("+ @2020-09")])]),t("td",[e._v(" Find all positive entries submitted during 2020-09 ")])]),t("tr",[t("td",[t("code",[e._v("- tag:sleep")])]),t("td",[e._v(" Find all negative entries also tagged with sleep ")])]),t("tr",[t("td",[t("code",[e._v("tag:sleep, tag:nap")])]),t("td",[e._v(" Find all entries tagged with sleep or nap ")])])])]},proxy:!0}])})],1)],1),t(s["a"],{staticClass:"mb-8",attrs:{tag:"section",id:"software",color:e.$theme.card.color}},[t(o["c"],{staticClass:"headline"},[e._v("Tempo is powered by free and open-source software")]),t(o["b"],{class:e.$theme.card.textSize},[t("p",[t("a",{attrs:{href:"https://github.com/agateblue/tempo"}},[e._v("Source code is publicly available")]),e._v(" and can be reused, modified and self-hosted according to your needs. ")]),t("p",[e._v(" You're welcome to contribute to the project by "),t("a",{attrs:{href:"https://github.com/agateblue/tempo/issues"}},[e._v("submitting new ideas")]),e._v(", reporting bugs, implementing changes, bugfixes, or simply sharing the word about Tempo if you feel like it :) ")])])],1)],1)},n=[],d={},c=d,l=a("2877"),h=Object(l["a"])(c,r,n,!1,null,null,null);t["default"]=h.exports}}]);