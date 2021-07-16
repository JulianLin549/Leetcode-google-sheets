如何利用 google sheet 和 google 內建的 GAS (google app script ) API 來做一個 leetcode 刷題統計試算表。

想要找軟體工作的畢業生，必定都會經過刷題這個痛苦的環節，如何讓自己刷題刷的不那麼痛苦以及追蹤自己的 progress 當然是至關重要。

這篇文章示範如何使用 google spreadsheet 來做一個自動化 leetcode 題目管理。只要輸入題號，google sheet 便會幫你把該題的資訊爬下來，方便之後回顧。

這邊我們需要的資訊為，leetcode 單題的 title，難易度，like/dislike 的數量，通過率以及這題的 tag。

首先我們要知道 leetcode 的 api 入口在哪，

因為 leetcode 是我們輸入題號之後去看以他的題目名稱作為他的 url

[`https://leetcode.com/problems/two-sum/`](https://leetcode.com/problems/two-sum/)

所以我們很可能需要先知道他的題目名稱

再者，我們打開 chrome 的開發者工具，可以看到題目的 request 是採用 graphql 模式

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/13081174-66c0-4a0b-baad-a86e2925245f/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/13081174-66c0-4a0b-baad-a86e2925245f/Untitled.png)

在 request 上面按右鍵 →copy as cURL 可以得到

```python
curl 'https://leetcode.com/graphql' \
  -H 'authority: leetcode.com' \
  -H 'sec-ch-ua: " Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"' \
  -H 'accept: */*' \
  -H 'x-newrelic-id: UAQDVFVRGwEAXVlbBAg=' \
  -H 'x-csrftoken: HpVfF2lLPwgBK9Um6Zh22FdEJ6vIhjkwqxMI7M3oROusuPoCv1nMte0SdI1EEKrp' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36' \
  -H 'content-type: application/json' \
  -H 'origin: https://leetcode.com' \
  -H 'sec-fetch-site: same-origin' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: https://leetcode.com/problems/two-sum/' \
  -H 'accept-language: zh-TW,zh;q=0.9' \
  -H 'cookie: _ga=GA1.2.621217177.1626427466; _gid=GA1.2.1386617142.1626427466; gr_user_id=56e4add4-38ae-43bd-9cd4-16873b3cf691; 87b5a3c3f1a55520_gr_session_id=20ff904f-1d81-4afa-b7a9-4a94129890b0; 87b5a3c3f1a55520_gr_session_id_20ff904f-1d81-4afa-b7a9-4a94129890b0=true; NEW_PROBLEMLIST_PAGE=1; csrftoken=HpVfF2lLPwgBK9Um6Zh22FdEJ6vIhjkwqxMI7M3oROusuPoCv1nMte0SdI1EEKrp; _gat=1' \
  --data-raw $'{"operationName":"questionData","variables":{"titleSlug":"two-sum"},"query":"query questionData($titleSlug: String\u0021) {\\n  question(titleSlug: $titleSlug) {\\n    questionId\\n    questionFrontendId\\n    boundTopicId\\n    title\\n    titleSlug\\n    content\\n    translatedTitle\\n    translatedContent\\n    isPaidOnly\\n    difficulty\\n    likes\\n    dislikes\\n    isLiked\\n    similarQuestions\\n    exampleTestcases\\n    contributors {\\n      username\\n      profileUrl\\n      avatarUrl\\n      __typename\\n    }\\n    topicTags {\\n      name\\n      slug\\n      translatedName\\n      __typename\\n    }\\n    companyTagStats\\n    codeSnippets {\\n      lang\\n      langSlug\\n      code\\n      __typename\\n    }\\n    stats\\n    hints\\n    solution {\\n      id\\n      canSeeDetail\\n      paidOnly\\n      hasVideoSolution\\n      paidOnlyVideo\\n      __typename\\n    }\\n    status\\n    sampleTestCase\\n    metaData\\n    judgerAvailable\\n    judgeType\\n    mysqlSchemas\\n    enableRunCode\\n    enableTestMode\\n    enableDebugger\\n    envInfo\\n    libraryUrl\\n    adminUrl\\n    __typename\\n  }\\n}\\n"}' \
  --compressed
```

裡面的—data-raw 就是我們的 graphql query

把它展看可看到有以下資訊

```markdown
'{
"operationName":"questionData",
"variables":{"titleSlug":"two-sum"},
"query": "query questionData($titleSlug: String\u0021) {\\n  
 question(titleSlug: $titleSlug) {\\n
questionId\\n  
 questionFrontendId\\n  
 boundTopicId\\n  
 title\\n  
 titleSlug\\n  
 content\\n  
 translatedTitle\\n  
 translatedContent\\n  
 isPaidOnly\\n  
 difficulty\\n  
 likes\\n  
 dislikes\\n  
 isLiked\\n  
 similarQuestions\\n  
 exampleTestcases\\n  
 contributors {\\n  
 username\\n  
 profileUrl\\n  
 avatarUrl\\n  
 **typename\\n  
 }\\n  
 topicTags {\\n  
 name\\n  
 slug\\n  
 translatedName\\n  
 **typename\\n  
 }\\n  
 companyTagStats\\n  
 codeSnippets {\\n  
 lang\\n  
 langSlug\\n  
 code\\n  
 **typename\\n  
 }\\n  
 stats\\n  
 hints\\n  
 solution {\\n  
 id\\n  
 canSeeDetail\\n  
 paidOnly\\n  
 hasVideoSolution\\n  
 paidOnlyVideo\\n  
 **typename\\n  
 }\\n  
 status\\n  
 sampleTestCase\\n  
 metaData\\n  
 judgerAvailable\\n  
 judgeType\\n  
 mysqlSchemas\\n  
 enableRunCode\\n  
 enableTestMode\\n  
 enableDebugger\\n  
 envInfo\\n  
 libraryUrl\\n  
 adminUrl\\n  
 \_\_typename\\n  
 }\\n
}\\n"
}'
```

東西有點太多，難以閱讀，我們把需要的留下，就變成

```markdown
`{ "operationName":"questionData", "variables":{"titleSlug":"${title}"}, "query":"query questionData($titleSlug: String\u0021) {\\n question(titleSlug: $titleSlug) { questionId questionFrontendId title titleSlug isPaidOnly difficulty likes dislikes topicTags { name } companyTagStats stats } }" }`
```

那要怎麼知道題好對應的題目標題呢？

這邊我用我找到的 api [https://leetcode.com/api/problems/all/](https://leetcode.com/api/problems/all/)

去把每個題目對應的題好和題目標題套出來，然後用 for 去尋找

所以整體思路就是，

1. 讀取使用者在 google sheet 輸入的題號
2. 先用 api [`https://leetcode.com/api/problems/all/`](https://leetcode.com/api/problems/all/) 去把題好對應的題目標題找出來
3. 找到想要的題目標題之後，用 graphql [`"https://leetcode.com/graphql"`](https://leetcode.com/graphql)去把該題資訊 query 出來
4. 把找到的資料存回 google sheet

# 開幹

然後我們把 google sheet 打開，點擊工具 → 指令碼編輯器

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/bf360d9e-4d4d-49ef-be04-5c36678d5708/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/bf360d9e-4d4d-49ef-be04-5c36678d5708/Untitled.png)

接著點擊左側的觸發條件，新增觸發條件，把 function 改成現在的 function，

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/553b9d28-88aa-4109-9b46-a99b35afe37e/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/553b9d28-88aa-4109-9b46-a99b35afe37e/Untitled.png)

選取活動類型：編輯文件時

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8e10dda9-2ac7-4dcb-8780-488b3852f569/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8e10dda9-2ac7-4dcb-8780-488b3852f569/Untitled.png)

這樣 google sheet 就會在更改時自動跑你寫的 script

# 編輯 google sheet

將 google sheet 的順序編輯成以下

要不要改顏色，凍結儲存格在於個人喜好。

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/367fae28-d562-408c-8a7a-f39192cc52df/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/367fae28-d562-408c-8a7a-f39192cc52df/Untitled.png)

# Coding Time, Babe!

回到剛剛編輯程式碼的地方，貼上以下程式。

```jsx
function atEdit(e) {
  var range = e.range;
  var column = range.getColumn();
  var row = range.getRow();
  if (column !== 1 || row == 1) return;
  var number = parseInt(e.value);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.getRange(row, 3).setValue("Retriving data, please wait...");

  var response = UrlFetchApp.fetch("https://leetcode.com/api/problems/all/");
  var data = JSON.parse(response.getContentText());
  var problems = data.stat_status_pairs;
  var title = "";
  for (var i = 0; i < problems.length; i++) {
    if (parseInt(problems[i].stat.frontend_question_id) == number) {
      title = problems[i].stat.question__title_slug;
      break;
    }
  }
  if (title === "") {
    sheet.getRange(row, 3).setValue("Data not found");
    return;
  }
  var response2 = UrlFetchApp.fetch("https://leetcode.com/graphql", {
    headers: {
      accept: "*/*",
      "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      "content-type": "application/json",
      "x-csrftoken": "blabla",
      "x-newrelic-id": "UAQDVFVRGwEAXVlbBAg=",
      referrer: `https://leetcode.com/problems/${title}/`,
    },
    payload: `{"operationName":"questionData","variables":{"titleSlug":"${title}"},"query":"query questionData($titleSlug: String\u0021) {\\n  question(titleSlug: $titleSlug) {    questionId    questionFrontendId   title  titleSlug     isPaidOnly    difficulty    likes   dislikes    topicTags { name }    companyTagStats   stats  }}"}`,
    method: "POST",
  });
  var res = JSON.parse(response2);
  var question = res.data.question;
  var title = question.title;
  var likes = question.likes;
  var dislikes = question.dislikes;
  var difficulty = question.difficulty;
  var diffColor = "";
  switch (difficulty) {
    case "Easy":
      diffColor = "#21CC0E";
      break;
    case "Medium":
      diffColor = "#F29705";
      break;
    case "Hard":
      diffColor = "#E60026";
      break;
  }
  var likeColor = "#4d4d4d";
  var likeRate = dislikes != 0 ? likes / dislikes : -1;
  if (likeRate > 5) {
    likeColor = "#21CC0E";
  } else if (likeRate < 1) {
    likeColor = "#E60026";
  }
  var tags = [];
  for (var i = 0; i < question.topicTags.length; i++) {
    tags.push(question.topicTags[i].name);
  }
  tags = tags.join(", ");

  var stats = JSON.parse(question.stats);
  var totalAccepted = stats.totalAcceptedRaw;
  var totalSubmission = stats.totalSubmissionRaw;
  var acRate = stats.acRate;
  sheet.getRange(row, 2).setValue(new Date());
  sheet.getRange(row, 3).setValue(title);
  sheet.getRange(row, 4).setValue(difficulty).setFontColor(diffColor);
  sheet.getRange(row, 5).setValue(likes);
  sheet.getRange(row, 6).setValue(dislikes);
  sheet
    .getRange(row, 7)
    .setValue(likes / dislikes)
    .setFontColor(likeColor);
  sheet.getRange(row, 8).setValue(acRate);
  sheet.getRange(row, 9).setValue(tags);
}
```

# 測試

朝著第一行 Number 空格輸入你今天完成的題數，測試看看有沒有自動跑出後面的資訊，如果有的話，恭喜你，離找到夢幻 offer 又更近一步了。

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/62a70852-a4e0-41c1-bef7-44234d2c9029/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/62a70852-a4e0-41c1-bef7-44234d2c9029/Untitled.png)
