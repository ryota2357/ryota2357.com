(self.webpackChunkryota2357=self.webpackChunkryota2357||[]).push([[775],{7484:function(t){t.exports=function(){"use strict";var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",a="hour",o="day",u="week",c="month",l="quarter",d="year",h="date",f="Invalid Date",m=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,p=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,g={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],n=t%100;return"["+t+(e[(n-20)%10]||e[n]||e[0])+"]"}},$=function(t,e,n){var r=String(t);return!r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},x={s:$,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return(e<=0?"+":"-")+$(r,2,"0")+":"+$(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return-t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,c),s=n-i<0,a=e.clone().add(r+(s?-1:1),c);return+(-(r+(n-i)/(s?i-a:a-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:c,y:d,w:u,d:o,D:h,h:a,m:s,s:i,ms:r,Q:l}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},v="en",y={};y[v]=g;var j=function(t){return t instanceof S},M=function t(e,n,r){var i;if(!e)return v;if("string"==typeof e){var s=e.toLowerCase();y[s]&&(i=s),n&&(y[s]=n,i=s);var a=e.split("-");if(!i&&a.length>1)return t(a[0])}else{var o=e.name;y[o]=e,i=o}return!r&&i&&(v=i),i||!r&&v},w=function(t,e){if(j(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new S(n)},D=x;D.l=M,D.i=j,D.w=function(t,e){return w(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var S=function(){function g(t){this.$L=M(t.locale,null,!0),this.parse(t)}var $=g.prototype;return $.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(D.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(m);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.$x=t.x||{},this.init()},$.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},$.$utils=function(){return D},$.isValid=function(){return!(this.$d.toString()===f)},$.isSame=function(t,e){var n=w(t);return this.startOf(e)<=n&&n<=this.endOf(e)},$.isAfter=function(t,e){return w(t)<this.startOf(e)},$.isBefore=function(t,e){return this.endOf(e)<w(t)},$.$g=function(t,e,n){return D.u(t)?this[e]:this.set(n,t)},$.unix=function(){return Math.floor(this.valueOf()/1e3)},$.valueOf=function(){return this.$d.getTime()},$.startOf=function(t,e){var n=this,r=!!D.u(e)||e,l=D.p(t),f=function(t,e){var i=D.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(o)},m=function(t,e){return D.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},p=this.$W,g=this.$M,$=this.$D,x="set"+(this.$u?"UTC":"");switch(l){case d:return r?f(1,0):f(31,11);case c:return r?f(1,g):f(0,g+1);case u:var v=this.$locale().weekStart||0,y=(p<v?p+7:p)-v;return f(r?$-y:$+(6-y),g);case o:case h:return m(x+"Hours",0);case a:return m(x+"Minutes",1);case s:return m(x+"Seconds",2);case i:return m(x+"Milliseconds",3);default:return this.clone()}},$.endOf=function(t){return this.startOf(t,!1)},$.$set=function(t,e){var n,u=D.p(t),l="set"+(this.$u?"UTC":""),f=(n={},n[o]=l+"Date",n[h]=l+"Date",n[c]=l+"Month",n[d]=l+"FullYear",n[a]=l+"Hours",n[s]=l+"Minutes",n[i]=l+"Seconds",n[r]=l+"Milliseconds",n)[u],m=u===o?this.$D+(e-this.$W):e;if(u===c||u===d){var p=this.clone().set(h,1);p.$d[f](m),p.init(),this.$d=p.set(h,Math.min(this.$D,p.daysInMonth())).$d}else f&&this.$d[f](m);return this.init(),this},$.set=function(t,e){return this.clone().$set(t,e)},$.get=function(t){return this[D.p(t)]()},$.add=function(r,l){var h,f=this;r=Number(r);var m=D.p(l),p=function(t){var e=w(f);return D.w(e.date(e.date()+Math.round(t*r)),f)};if(m===c)return this.set(c,this.$M+r);if(m===d)return this.set(d,this.$y+r);if(m===o)return p(1);if(m===u)return p(7);var g=(h={},h[s]=e,h[a]=n,h[i]=t,h)[m]||1,$=this.$d.getTime()+r*g;return D.w($,this)},$.subtract=function(t,e){return this.add(-1*t,e)},$.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||f;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=D.z(this),s=this.$H,a=this.$m,o=this.$M,u=n.weekdays,c=n.months,l=function(t,n,i,s){return t&&(t[n]||t(e,r))||i[n].slice(0,s)},d=function(t){return D.s(s%12||12,t,"0")},h=n.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},m={YY:String(this.$y).slice(-2),YYYY:this.$y,M:o+1,MM:D.s(o+1,2,"0"),MMM:l(n.monthsShort,o,c,3),MMMM:l(c,o),D:this.$D,DD:D.s(this.$D,2,"0"),d:String(this.$W),dd:l(n.weekdaysMin,this.$W,u,2),ddd:l(n.weekdaysShort,this.$W,u,3),dddd:u[this.$W],H:String(s),HH:D.s(s,2,"0"),h:d(1),hh:d(2),a:h(s,a,!0),A:h(s,a,!1),m:String(a),mm:D.s(a,2,"0"),s:String(this.$s),ss:D.s(this.$s,2,"0"),SSS:D.s(this.$ms,3,"0"),Z:i};return r.replace(p,(function(t,e){return e||m[t]||i.replace(":","")}))},$.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},$.diff=function(r,h,f){var m,p=D.p(h),g=w(r),$=(g.utcOffset()-this.utcOffset())*e,x=this-g,v=D.m(this,g);return v=(m={},m[d]=v/12,m[c]=v,m[l]=v/3,m[u]=(x-$)/6048e5,m[o]=(x-$)/864e5,m[a]=x/n,m[s]=x/e,m[i]=x/t,m)[p]||x,f?v:D.a(v)},$.daysInMonth=function(){return this.endOf(c).$D},$.$locale=function(){return y[this.$L]},$.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=M(t,e,!0);return r&&(n.$L=r),n},$.clone=function(){return D.w(this.$d,this)},$.toDate=function(){return new Date(this.valueOf())},$.toJSON=function(){return this.isValid()?this.toISOString():null},$.toISOString=function(){return this.$d.toISOString()},$.toString=function(){return this.$d.toUTCString()},g}(),b=S.prototype;return w.prototype=b,[["$ms",r],["$s",i],["$m",s],["$H",a],["$W",o],["$M",c],["$y",d],["$D",h]].forEach((function(t){b[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),w.extend=function(t,e){return t.$i||(t(e,S,w),t.$i=!0),w},w.locale=M,w.isDayjs=j,w.unix=function(t){return w(1e3*t)},w.en=y[v],w.Ls=y,w.p={},w}()},6856:function(t,e,n){"use strict";n.d(e,{ZR:function(){return u},b0:function(){return o},Ar:function(){return s},pQ:function(){return a}});var r=n(1883),i=n(5893);var s=t=>{let{id:e,children:n}=t;const{site:s}=(0,r.useStaticQuery)("713408048");return(0,i.jsxs)("div",{id:"layout",children:[(0,i.jsxs)("header",{children:[(0,i.jsx)("div",{className:"logo",children:(0,i.jsx)(r.Link,{to:"/",children:null==s?void 0:s.siteMetadata.title})}),(0,i.jsx)("nav",{children:(0,i.jsxs)("ul",{children:[(0,i.jsx)("li",{children:(0,i.jsx)(r.Link,{to:"/",children:"Home"})}),(0,i.jsx)("li",{children:(0,i.jsx)(r.Link,{to:"/about",children:"About"})}),(0,i.jsx)("li",{children:(0,i.jsx)(r.Link,{to:"/blog",children:"Blog"})}),(0,i.jsx)("li",{children:(0,i.jsx)(r.Link,{to:"/works",children:"Works"})})]})})]}),(0,i.jsx)("main",{id:e,children:n}),(0,i.jsxs)("footer",{children:[(0,i.jsxs)("p",{children:["Built with"," ",(0,i.jsx)("a",{href:"https://www.gatsbyjs.com",style:{color:"inherit",fontWeight:"bold"},children:"Gatsby"})]}),(0,i.jsxs)("p",{children:["©2022 ",null==s?void 0:s.siteMetadata.author.name," All Rights Reserved."]})]})]})};var a=t=>{let{title:e,type:n,image:s,description:a,noindex:o=!1}=t;const{site:u}=(0,r.useStaticQuery)("3405293526"),c=null!=a?a:null==u?void 0:u.siteMetadata.description,l="default"==s?"https://raw.githubusercontent.com/ryota2357/ryota2357-github-pages/main/src/images/profile-pic.jpg":"https://raw.githubusercontent.com/ryota2357/ryota2357-github-pages-images/og-image/"+s.join("/")+".png";return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("title",{children:e}),(0,i.jsx)("meta",{name:"description",content:c}),(0,i.jsx)("meta",{property:"og:title",content:e}),(0,i.jsx)("meta",{property:"og:description",content:c}),(0,i.jsx)("meta",{property:"og:type",content:n}),(0,i.jsx)("meta",{property:"og:image",content:l}),(0,i.jsx)("meta",{property:"twitter:card",content:"summary_large_image"}),(0,i.jsx)("meta",{property:"twitter:creator",content:(null==u?void 0:u.siteMetadata.social.twitter.name)||""}),(0,i.jsx)("meta",{property:"twitter:title",content:e}),(0,i.jsx)("meta",{property:"twitter:description",content:c}),o?(0,i.jsx)("meta",{property:"robots",content:"noindex"}):(0,i.jsx)(i.Fragment,{})]})};var o=t=>{let{title:e,children:n}=t;return(0,i.jsxs)("div",{className:"content-block",children:[(0,i.jsx)("h2",{children:e}),(0,i.jsx)("div",{className:"children",children:n})]})};var u=t=>{let{data:e}=t;return(0,i.jsx)("div",{className:"blog-list",children:(0,i.jsx)("ul",{children:e.map((t=>{var e;return(0,i.jsxs)("li",{children:[(0,i.jsx)("div",{className:"item-date",children:t.date}),(0,i.jsx)("div",{className:"item-title",children:(0,i.jsx)(r.Link,{to:t.slug,children:t.title})}),(0,i.jsx)("div",{className:"item-tags",children:null===(e=t.tags)||void 0===e?void 0:e.map(((t,e)=>(0,i.jsx)(r.Link,{to:"/blog/tag/"+t,className:"item-tag",children:t},e)))})]},t.slug)}))})})}},1891:function(t,e,n){"use strict";n.r(e),n.d(e,{Head:function(){return u}});var r=n(6856),i=n(7484),s=n.n(i),a=n(5893);function o(t){return s()(new Date(t)).format("YYYY/MM/DD (HH:mm)")}const u=()=>(0,a.jsx)(r.pQ,{title:"Works",type:"website",image:["works"]});e.default=t=>{let{data:e}=t;return(0,a.jsxs)(r.Ar,{id:"works-page",children:[(0,a.jsx)("h1",{children:"Works"}),e.allWorksDataYaml.nodes.map((t=>(0,a.jsx)(r.b0,{title:t.name,children:(0,a.jsx)("ul",{children:t.data.map(((t,e)=>{var n;return(0,a.jsxs)("li",{children:[(0,a.jsx)("h3",{children:(0,a.jsx)("a",{href:t.url,target:"_blank",children:t.title})}),(0,a.jsxs)("div",{className:"item",children:[(0,a.jsxs)("div",{className:"indent",children:[(0,a.jsxs)("p",{className:"gray",children:["公開: ",(0,a.jsx)("time",{children:o(new Date(t.created))})]}),t.created!=t.update&&(0,a.jsxs)("p",{className:"gray",children:["最終更新:"," ",(0,a.jsx)("time",{children:o(new Date(t.update))})]}),t.description.split("\n").map((t=>(0,a.jsx)("p",{children:t})))]}),(0,a.jsx)("img",{src:null===(n=t.image)||void 0===n?void 0:n.publicURL,alt:t.title+" icon",style:{objectFit:"cover",width:"8rem",height:"8rem"}})]})]},e)}))})})))]})}}}]);
//# sourceMappingURL=component---src-pages-works-tsx-0e2d5a661f429081f205.js.map