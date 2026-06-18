export function AboutView() {
    return (
        <article className="about">
            <div className="about-sections">
                <section className="about-section">
                    <h3 className="about-section-title">What is this site?</h3>
                    <div className="about-section-body">
                        This site is a fan-made site showing a leaderboard for
                        the story and commission rankings of the game Love
                        Nikki.
                    </div>
                </section>

                <section className="about-section">
                    <h3 className="about-section-title">
                        What is ranking? How do I rank?
                    </h3>
                    <div className="about-section-body">
                        Ranking is when you achieve a top 20 score on a story or
                        commission stage.
                        <br />
                        <br />
                        As a brief overview, you need to do the following to
                        rank:
                        <ol>
                            <li>
                                Use a guide to obtain the best items for your
                                wardrobe for a stage.
                            </li>
                            <li>
                                Play the stage, aiming to hit Smiling and Charm
                                skills on the highest attribute, Smiling again
                                on the second highest, and avoid negative skills
                                from your opponent.
                            </li>
                        </ol>
                    </div>
                </section>

                <section className="about-section">
                    <h3 className="about-section-title">How do points work?</h3>
                    <div className="about-section-body">
                        This site uses a points system to rank players on the
                        leaderboard.
                        <br />
                        Points are awarded per stage ranking: rank 1 = 20 pts,
                        rank 2 = 19 pts, … rank 20 = 1 pt.
                    </div>
                </section>

                <section className="about-section">
                    <h3 className="about-section-title">Updates</h3>
                    <div className="about-section-body">
                        This site's data is updated once a week. You can see the
                        date of the last update at the top of the page. If it
                        has been more than a week since the last update please
                        reach out and let me know.
                    </div>
                </section>

                <section className="about-section">
                    <h3 className="about-section-title">Contributing</h3>
                    <div className="about-section-body">
                        If you can code and have a feature or fix you'd like to
                        add to this site, you can submit a pull request to the public
                        repository on GitHub.
                    </div>
                </section>

                <section className="about-section">
                    <h3 className="about-section-title">Links</h3>
                    <div className="about-section-body">
                        <p>
                            syngtu - My Discord username, the best way to
                            contact me.
                        </p>
                        <p>
                            <a href="https://discord.com/invite/p5xkgqt">
                                Love Nikki Ranking Discord
                            </a>{" "}
                            - Community for tips and discussion on ranking.
                        </p>

                        <p>
                            <a href="https://ln.nikkis.info/">Nikki's Info</a> -
                            A guide you can use to get the best items for a
                            stage.
                        </p>
                        <p>
                            <a href="https://nikkicalc.com/">Nikki Calc</a> -
                            Another guide you can use to get the best items for
                            a stage.
                        </p>
                        <p>
                            <a href="https://github.com/crescendont/ln-scoring-algorithm-updated">
                                LN Scoring Algorithm
                            </a>{" "}
                            - Yet another guide you can use to get the best
                            items for a stage.
                        </p>
                    </div>
                </section>
            </div>
        </article>
    );
}
