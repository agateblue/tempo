(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d2268de"],{e8c8:function(e){e.exports=JSON.parse('{"id":"builtin:tags","label":"Tags","version":"1","vizualisations":[{"label":"Predominent tags","query":"SELECT id, entries, mood from ? ORDER BY entries DESC limit 10","chartType":"table","source":"tags"},{"label":"Positive tags","query":"SELECT id, entries, mood from ? where mood > 0 ORDER BY mood DESC limit 10","chartType":"table","source":"tags"},{"label":"Negative tags","query":"SELECT id, entries, mood from ? where mood < 0 ORDER BY mood ASC limit 10","chartType":"table","source":"tags"}]}')}}]);