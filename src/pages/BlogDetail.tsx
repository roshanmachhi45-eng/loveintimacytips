import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Calendar, User, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import Seo from '../components/Seo';
import BlogImage from '../components/BlogImage';
import BlogCard from '../components/BlogCard';
import { fetchPostBySlug, fetchRelatedPosts, type BlogPost } from '../lib/blogApi';
import { DEFAULT_ARTICLES } from '../lib/defaultArticles';
import { BRAND } from '../lib/brand';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const FALLBACK_CONTENT: Record<string, string[]> = {
  'strengthen-relationship-every-day': [
    'Strong relationships are not built overnight — they are the result of small, intentional actions repeated day after day. Here are ten simple habits that can help you and your partner feel closer and more connected.',
    '1. Say thank you for the little things. Acknowledging everyday efforts — making coffee, doing the dishes — makes your partner feel valued.',
    '2. Check in emotionally. A simple "How are you really doing today?" shows you care beyond the surface.',
    '3. Put your phone away during meals. Undistracted time together, even for twenty minutes, strengthens your bond.',
    '4. Laugh together. Share a joke, watch a funny video, or recall a silly memory — laughter releases oxytocin and builds intimacy.',
    '5. Leave a surprise note. A sticky note on the mirror or a random text midday can brighten your partner\'s entire afternoon.',
    '6. Take a short walk together. Fresh air and side-by-side movement naturally encourage deeper conversation.',
    '7. Compliment genuinely. Tell your partner what you admire about them — their kindness, their patience, their humour.',
    '8. Learn something new together. Trying a new recipe or a new hobby as a team builds shared memories.',
    '9. Apologise sincerely when you are wrong. A heartfelt "I\'m sorry" repairs trust faster than anything else.',
    '10. End the day on a warm note. A hug, a kind word, or a shared recap of the day helps you both rest feeling connected.',
    'None of these habits take much time, but together they create a culture of appreciation, presence, and love that keeps a relationship strong for years to come.',
  ],
  'communicate-better-with-partner': [
    'Communication is the lifeblood of any relationship. When couples communicate well, they feel understood, respected, and emotionally safe. When they do not, even small misunderstandings can grow into painful conflicts.',
    'Practice active listening. This means giving your full attention, making eye contact, and reflecting back what you hear before responding. Instead of planning your reply while your partner speaks, focus completely on understanding their perspective.',
    'Use "I" statements. Instead of "You never help around the house," try "I feel overwhelmed when I handle all the chores alone." This small shift reduces defensiveness and opens the door to real dialogue.',
    'Pick the right time. Important conversations need the right setting. Avoid bringing up sensitive topics when either of you is tired, hungry, or stressed. Ask, "Is now a good time to talk?" before diving in.',
    'Validate emotions even when you disagree. You can say, "I understand why that upset you," without agreeing with their conclusion. Validation is not agreement — it is acknowledgment.',
    'Ask open-ended questions. Instead of yes-or-no questions, try "What was that like for you?" or "How do you feel about this?" These invite deeper sharing.',
    'Take a break when emotions run high. If a conversation gets heated, it is okay to say, "I need twenty minutes to cool down, and then I want to come back to this." A short pause prevents saying things you will regret.',
    'Good communication is a skill, and like any skill it improves with practice. The effort you put into understanding each other is one of the greatest investments you can make in your relationship.',
  ],
  'fun-date-night-ideas-at-home': [
    'A memorable date night does not require a fancy restaurant or an expensive outing. Some of the most romantic evenings happen right at home, with a little creativity and a willingness to have fun together.',
    'Cook a new recipe together. Pick a cuisine you have never tried, find a recipe online, and tackle it as a team. The mess, the laughter, and the shared accomplishment make it special.',
    'Have a living-room picnic. Lay a blanket on the floor, prepare simple snacks, and enjoy the novelty of eating somewhere different. String lights or candles add instant ambiance.',
    'Build a blanket fort. It sounds silly, but recreating the forts of your childhood is surprisingly cozy and fun. Add pillows, snacks, and a movie for the ultimate comfort evening.',
    'Try a wine or dessert tasting. Pick three or four options, taste them side by side, and compare notes. It feels elegant and playful at the same time.',
    'Stargaze from your balcony or backyard. Lay out a blanket, download a free stargazing app, and explore the night sky together. It is quiet, romantic, and completely free.',
    'Have a game night. Pull out a board game, a deck of cards, or try a two-player video game. Friendly competition brings out laughter and playfulness.',
    'Create a couples playlist. Take turns adding songs that remind you of each other or of special moments. Then play it while you cook, clean, or just relax together.',
    'The magic of an at-home date is not in what you do — it is in the intention. Setting aside dedicated time to focus only on each other is what makes the evening feel special.',
  ],
  'resolve-arguments-without-hurting': [
    'Every couple argues. Disagreements are natural when two people share a life. What separates healthy relationships from unhealthy ones is not whether couples fight — it is how they fight.',
    'Soften your start. Research shows that conversations almost always end the way they begin. Instead of launching into criticism, try starting with, "I want to talk about something that has been on my mind," in a calm, warm tone.',
    'Focus on one issue at a time. It is tempting to bring up every frustration at once, but that overwhelms both of you. Stick to the current topic and resist the urge to list past grievances.',
    'Avoid contempt. Eye-rolling, sarcasm, and name-calling are the most destructive behaviours in a conflict. Contempt signals disrespect, and over time it erodes the foundation of a relationship.',
    'Use a "time-out" wisely. If your heart rate spikes or you feel flooded, say, "I need a break. Let me calm down and we will come back to this in thirty minutes." Then actually return — a time-out only works if you follow through.',
    'Look for the feeling beneath the complaint. When your partner says, "You are always on your phone," they might really be saying, "I miss feeling connected to you." Respond to the feeling, not just the words.',
    'End with repair. A repair can be an apology, a hug, a joke, or simply saying, "I did not like how that went, and I want us to be okay." Repairs help both of you recover and move forward.',
    'Arguments handled with empathy and respect do not damage a relationship — they can actually strengthen it. Each time you work through a disagreement together, you build confidence that you can handle whatever comes your way.',
  ],
  'importance-of-quality-time': [
    'There is a big difference between being in the same room and being truly present with each other. Quality time — focused, undistracted, intentional time together — is one of the most important ingredients in a healthy relationship.',
    'Quality time does not have to be elaborate. A fifteen-minute conversation over coffee, a walk around the block, or cooking dinner together without the TV on all count. What matters is that you are mentally and emotionally present.',
    'Research consistently shows that couples who spend dedicated, distraction-free time together report higher relationship satisfaction. They feel closer, more understood, and more appreciated.',
    'One of the biggest barriers to quality time is the phone. Even having a phone visible on the table reduces the depth of conversation. Putting devices away sends a clear message: "Right now, you are my priority."',
    'Quality time does not require doing the same activity. Sitting together while one person reads and the other sketches can be deeply connecting, because you are sharing space and presence.',
    'Try creating a daily ritual. It could be ten minutes of talking before bed, morning coffee together, or a short walk after dinner. Rituals create a predictable, reliable space for connection that both of you can count on.',
    'The quantity of time matters less than the quality. Ten minutes of full, warm attention is worth more than three hours of sitting in the same room while scrolling through separate feeds.',
    'When you give your partner the gift of your full presence, you are telling them that they matter. That message, repeated consistently over time, is what keeps a relationship feeling alive and loved.',
  ],
  'building-trust-lasting-relationship': [
    'Trust is the invisible thread that holds a relationship together. Without it, every interaction carries an undercurrent of doubt. With it, both partners feel secure enough to be vulnerable, honest, and deeply connected.',
    'Trust is not built in a single grand gesture. It grows through hundreds of small, consistent actions — keeping your word, showing up when you say you will, and being honest even when it is uncomfortable.',
    'Be reliable. Follow through on commitments, both big and small. If you say you will call at seven, call at seven. Reliability tells your partner, "You can count on me."',
    'Be transparent. Share your thoughts, your day, and your feelings openly. You do not need to share every detail, but a pattern of openness signals that you have nothing to hide.',
    'Admit mistakes quickly. Trying to cover up an error damages trust far more than the mistake itself. Owning it — "I messed up, and here is how I am going to fix it" — actually builds trust.',
    'Respect boundaries. Trust thrives when both people feel their boundaries are honoured. Ask what your partner needs, and respect it even when you do not fully understand it.',
    'Be consistent over time. Trust is not a one-time achievement — it is maintained through ongoing behaviour. Consistency creates a sense of safety that allows the relationship to deepen.',
    'When trust is strong, everything else in the relationship becomes easier. Conflicts are less threatening, vulnerability feels safe, and both partners can relax into the knowledge that they are loved and secure.',
  ],
};

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');
    fetchPostBySlug(slug)
      .then((data) => {
        if (!data) {
          const fallback = DEFAULT_ARTICLES.find((a) => a.slug === slug);
          if (fallback) {
            setPost(fallback);
            setRelated(DEFAULT_ARTICLES.filter((a) => a.slug !== slug).slice(0, 3));
          } else {
            setError('Article not found.');
          }
          return;
        }
        setPost(data);
        fetchRelatedPosts(data.category, data.slug, 3).then((relatedData) => {
          if (relatedData.length === 0) {
            setRelated(DEFAULT_ARTICLES.filter((a) => a.slug !== slug).slice(0, 3));
          } else {
            setRelated(relatedData);
          }
        });
      })
      .catch(() => {
        const fallback = DEFAULT_ARTICLES.find((a) => a.slug === slug);
        if (fallback) {
          setPost(fallback);
          setRelated(DEFAULT_ARTICLES.filter((a) => a.slug !== slug).slice(0, 3));
        } else {
          setError('Article not found.');
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4">
        <p className="text-gray-500 text-sm mb-4">{error || 'Article not found.'}</p>
        <Link to="/" className="text-rose-500 text-sm font-semibold">Back to Home</Link>
      </div>
    );
  }

  const fallbackParagraphs = FALLBACK_CONTENT[post.slug] || [post.excerpt, 'This article is part of the Loveons collection of relationship guidance.'];
  const paragraphs = post.content && post.content.trim().length > 0
    ? post.content.split('\n\n').filter((p) => p.trim())
    : fallbackParagraphs;
  const canonicalUrl = `${BRAND.domain}/blog/${post.slug}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    image: post.image_url || undefined,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: BRAND.name },
    datePublished: post.published_at,
    mainEntityOfPage: canonicalUrl,
  };

  return (
    <>
      <Seo
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        path={`/blog/${post.slug}`}
        ogImage={post.image_url || undefined}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen pt-14 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-rose-500 font-semibold mb-4 hover:gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <article>
            <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden mb-6">
              <BlogImage
                src={post.image_url}
                alt={post.image_alt || post.title}
                className="w-full h-full"
                loading="eager"
              />
              <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-rose-600 backdrop-blur-sm">
                {post.category}
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold text-gray-800 leading-tight mb-3">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.published_at ? formatDate(post.published_at) : ''}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {post.reading_time}
              </span>
            </div>

            <div className="space-y-4">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed">
                  {para.trim()}
                </p>
              ))}
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-500 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {related.length > 0 && (
            <section className="mt-12 pt-8 border-t border-rose-100">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-rose-500" />
                <h2 className="font-display text-lg font-bold text-gray-800">Related Articles</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((r) => (
                  <BlogCard key={r.id} post={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
