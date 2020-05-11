<template>
  <main class="single-column">
    <section class="widget">
      <h1>
        About Tempo
      </h1>
      <router-link :to="{name: 'Home'}">Go back</router-link>
      <p>
        Tempo is a personnal log and mood tracker. You can use it to track what's going on in your life and how different events affect your well-being.
      </p>
      <p>Features:</p>
      <ul>
        <li>Markdown syntax</li>
        <li><a href="#private">Private by design</a></li>
        <li><a href="#offline">Offline first</a></li>
        <li><a href="#mood-tracking">Mood tracking</a></li>
        <li><a href="#search">Powerful tagging and filtering</a></li>
        <li><a href="#software">Powered by free and open-source software</a></li>
      </ul>
    </section>
    <section class="attached widget">
      <h2>
        How does it work?
      </h2>
      <p>
        Use Tempo as you would use a personnal log. Write notes when you feel like it, and use hashtags and moodtags to indicate how you feel.
      </p>
    </section>
    <section id="private" class="attached widget">
      <h2>
        Where is the data stored?
      </h2>
      <p>The data never leaves your browser and isn't sent to any third-party or server. The only exception to that is when you enable (optional) syncing with other devices, through a CouchDB server of your choice.</p>
      <p>All your data can also be exported in JSON and Markdown format at any time.</p>
    </section>
    <section id="offline" class="attached widget">
      <h2>
        Does it work offline?
      </h2>
      <p>Yes! Tempo is a Progressive Web App (PWA) and can be accessed and used even without an internet connection.</p>
    </section>
    <section class="attached widget">
      <h2>
        Hashtags
      </h2>
      <p>
        While entirely optional, hashtags and moodtags can help you categorize your notes and track your moods. Here is a sample note using hashtags:
      </p>
      <blockquote>
        Had a great day at <a href="">#work!</a>
      </blockquote>
      <p>Hashtags can help you to categorize your notes and search them later.</p>
    </section>
    <section id="mood-tracking" class="attached widget">
      <h2>
        Moodtags
      </h2>
      <p>Moodtags work similarly, but allow you to associate a mood with a given word. For instance:</p>
      <blockquote>
        Stephanie and I had an argument. I feel <a href="">--angry</a> and <a href="">-confused</a>…
      </blockquote>
      <p>
        By using the <code>-</code> tag, you indicate to Tempo that <code>angry</code> and <code>confused</code> are negative feelings. Similarly, you could use the <code>+</code> tag in front of a word to indicate a positive feeling. You can repeat these signs up to three time to indicate a greater intensity.
      </p>
      <p>
        When present, <code>-</code> and <code>+</code> tags are used to compute the mood score of each note. This score is then used in the daily mood widget to track your moods over time.
      </p>
      <p>
        Each occurence of <code>-</code> and <code>+</code> in a note will decrease or increase the mood score by 1.
      </p>
      <p>
        There are a couple additional tags you can use, that don't affect the mood score, but can be useful regardless:
      </p>
      <ul>
        <li><code>~</code>: indicate mixed feelings</li>
        <li><code>?</code>: indicate you don't know how you feel</li>
        <li><code>!</code>: indicate that something is important</li>
      </ul>
      <p>
        You can freely mix any and all these tags in the same note, and use different moodtags with the same words. For instance:
      </p>
      <blockquote>
        I hate insomnia, I'm feeling so <a href="">---tired</a>…
      </blockquote>
      <blockquote>
        Had a good sport session this morning, I'm <a href="">+tired</a> but happy.
      </blockquote>
    </section>
    <section id="search" class="attached widget">
      <h2>
        Filtering notes
      </h2>
      <p>
        The search bar let you filter notes that match your query. The daily mood widget is also updated accordingly. You can find some basic queries below:
      </p>
      <table>
        <tr>
          <td>
            <code>sport</code>
          </td>
          <td>
            Find all the entries containing the word "sport"
          </td>
        </tr>
        <tr>
          <td>
            <code>#sport</code>
          </td>
          <td>
            Find all the entries tagged with #sport
          </td>
        </tr>
        <tr>
          <td>
            <code>-sport</code>
          </td>
          <td>
            Find all the entries tagged with -sport
          </td>
        </tr>
        <tr>
          <td>
            <code>@2020-09-17</code>
          </td>
          <td>
            Find all the entries submitted on 2020-09-17
          </td>
        </tr>
        <tr>
          <td>
            <code>@2020</code>
          </td>
          <td>
            Find all the entries submitted during 2020
          </td>
        </tr>
        <tr>
          <td>
            <code>@2020-08</code>
          </td>
          <td>
            Find all the entries submitted during 2020-08
          </td>
        </tr>
        <tr>
          <td>
            <code>+</code>
          </td>
          <td>
            Find all entries with a positive moodtag (also works with <code>-</code>, <code>?</code>, <code>!</code> and <code>~</code>)
          </td>
        </tr>
      </table>
      <p>
        You can mix various parameters to further refine your results. Here are some more advanced queries:
      </p>
      <table>
        <tr>
          <td>
            <code>+ @2020-09</code>
          </td>
          <td>
            Find all positive entries submitted during 2020-09
          </td>
        </tr>
        <tr>
          <td>
            <code>- #sleep</code>
          </td>
          <td>
            Find all negative entries also tagged with #sleep
          </td>
        </tr>
      </table>
    </section>
    <section id="software" class="attached widget">
      <h2>
        Tempo is powered by free and open-source software
      </h2>
      <p>
        <a href="https://code.eliotberriot.com/eliotberriot/tempo">Source code is publicly available</a> and can be reused, modified and self-hosted according to your needs.
      </p>
    </section>
  </main>
</template>

<script>
export default {}
</script>
