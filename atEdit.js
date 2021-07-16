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
