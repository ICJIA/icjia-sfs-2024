---
title: "Sites"
metaTitle: "Program Sites Across Illinois"
slug: "sites"
summary: "Find current Safe From the Start (SFS) program sites and providers serving children ages 0–5 across Illinois, with areas served and contact information for each site."
publishedAt: "2024-05-01"
section: ""
searchMeta: null
---

<div style="margin-bottom: 50px"></div>
<h2 style="border-bottom: none; text-align: center; padding-bottom: 1.5rem;">Current SFS Programs SFY 2027</h2>

<style>
/* ------------------------------------------------------------------ *
 * SFS sites directory table
 *
 * Two layouts from one table. At >=768px it renders as an ordinary
 * three-column data table. Below that — and at high zoom, where the CSS
 * viewport narrows the same way — each row reflows into a stacked card so
 * the content never needs horizontal scrolling and the type stays at a
 * readable size instead of shrinking to fit.
 *
 * Because the stacked layout overrides `display` on the table elements
 * (which drops the native table semantics), every element carries an
 * explicit ARIA role in the markup to keep the accessibility tree intact.
 * The per-cell labels are aria-hidden: assistive tech gets the real
 * <th> associations, sighted users get the visible label.
 *
 * Selectors are prefixed with .markdown-body to outrank the generic
 * table rules in layouts/MarkdownPage.astro.
 * ------------------------------------------------------------------ */

.markdown-body .sfs-sites-wrap {
    position: relative;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 1.5rem;
}

/* Only focusable when it actually overflows — see sites.astro. */
.markdown-body .sfs-sites-wrap:focus-visible {
    outline: 3px solid var(--color-sfs-blue);
    outline-offset: 3px;
}

.markdown-body .sfs-sites-table {
    width: 100%;
    /* Auto layout hands most of the width to "Areas Serviced" (one long run of
       county names) and starves the contact column, whose <br>-separated lines
       each measure short. Fixed layout + the colgroup below split it sensibly. */
    table-layout: fixed;
    min-width: 44rem;
    margin: 0;
    border-collapse: collapse;
    font-size: 0.875rem;
    line-height: 1.45;
}

.markdown-body .sfs-sites-table caption {
    caption-side: top;
    text-align: left;
    padding: 0 0 0.75rem;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: #3f4a54;
}

.markdown-body .sfs-sites-table th,
.markdown-body .sfs-sites-table td {
    padding: 0.625rem 0.75rem;
    text-align: left;
    vertical-align: top;
    border: 1px solid #d6dbe0;
    /* Fixed layout can hand a column less room than a long email address
       needs; break rather than spill out of the cell. */
    overflow-wrap: break-word;
}

.markdown-body .sfs-sites-table thead th {
    background: #eef1f5;
    font-weight: 700;
    vertical-align: bottom;
    border-bottom-width: 2px;
}

/* First column is the row header (the agency name). */
.markdown-body .sfs-sites-table tbody th {
    font-weight: 700;
}

.markdown-body .sfs-sites-table tbody tr:nth-child(even) > * {
    background-color: #f6f8fa;
}

.markdown-body .sfs-sites-table a {
    color: var(--color-sfs-blue-dark);
    text-decoration: underline;
    text-underline-offset: 2px;
}

.markdown-body .sfs-sites-table a:hover,
.markdown-body .sfs-sites-table a:focus-visible {
    color: var(--color-sfs-blue-darker);
    text-decoration-thickness: 2px;
}

/* Visible only in the stacked layout below. */
.markdown-body .sfs-sites-table .cell-label {
    display: none;
}

/* ---- Stacked card layout ---------------------------------------- */

@media (max-width: 767px) {
    .markdown-body .sfs-sites-wrap {
        overflow-x: visible;
    }

    .markdown-body .sfs-sites-table,
    .markdown-body .sfs-sites-table tbody,
    .markdown-body .sfs-sites-table tbody tr,
    .markdown-body .sfs-sites-table tbody th,
    .markdown-body .sfs-sites-table tbody td {
        display: block;
        width: auto;
        min-width: 0;
    }

    /* The caption must go block too. Left as display:table-caption inside a
       now-block table it shrink-wraps to a sliver and wraps one word per
       line. */
    .markdown-body .sfs-sites-table caption {
        display: block;
    }

    /* Cards are narrow enough that a long address may need to break
       mid-token to stay inside the viewport at 320px. */
    .markdown-body .sfs-sites-table tbody td {
        overflow-wrap: anywhere;
    }

    /* Kept in the accessibility tree — only the visual column strip goes. */
    .markdown-body .sfs-sites-table thead {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        white-space: nowrap;
        clip-path: inset(50%);
        border: 0;
    }

    .markdown-body .sfs-sites-table {
        font-size: 0.9375rem;
    }

    .markdown-body .sfs-sites-table tbody tr {
        margin-bottom: 1rem;
        border: 1px solid #d6dbe0;
        border-radius: 6px;
        overflow: hidden;
    }

    /* Card header: the agency name. */
    .markdown-body .sfs-sites-table tbody th {
        padding: 0.75rem;
        font-size: 1rem;
        border: 0;
        border-bottom: 1px solid #d6dbe0;
    }

    .markdown-body .sfs-sites-table tbody td {
        padding: 0.75rem;
        border: 0;
    }

    .markdown-body .sfs-sites-table tbody td + td {
        border-top: 1px solid #e6eaee;
    }

    /* Striping reads as noise once rows are cards; header strip carries it. */
    .markdown-body .sfs-sites-table tbody tr:nth-child(even) > * {
        background-color: transparent;
    }

    .markdown-body .sfs-sites-table tbody th {
        background-color: #eef1f5;
    }

    .markdown-body .sfs-sites-table .cell-label {
        display: block;
        margin-bottom: 0.25rem;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #4a555f;
    }
}

@media (prefers-reduced-motion: no-preference) {
    .markdown-body .sfs-sites-wrap {
        scroll-behavior: smooth;
    }
}
</style>

<div class="sfs-sites-wrap" id="sites-table">

<table class="sfs-sites-table" role="table">
    <caption>
        Safe From the Start program sites for SFY 2027, with the areas each site
        serves and its contact information. On narrow screens each site is
        listed as a stacked card rather than a table row.
    </caption>
    <colgroup>
        <col style="width: 20%">
        <col style="width: 32%">
        <col style="width: 48%">
    </colgroup>
    <thead role="rowgroup">
        <tr role="row">
            <th scope="col" role="columnheader">SFS Site</th>
            <th scope="col" role="columnheader">Areas Serviced</th>
            <th scope="col" role="columnheader">Contact Information</th>
        </tr>
    </thead>
    <tbody role="rowgroup">
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://www.sga-youth.org/" target="_blank" rel="noopener noreferrer">SGA Youth &amp; Family Services</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>Cook County: Village of Summit, Town of Cicero, Berwyn</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Melissa Moore<br>11 East Adams St, Suite 240<br>Chicago, IL 60603-6309<br>County: Cook<br>Email: <a href="mailto:MMoore@sga-youth.org">MMoore@sga-youth.org</a></td>
        </tr>
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://www.centerforpreventionofabuse.org/" target="_blank" rel="noopener noreferrer">Center for Prevention of Abuse</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>Peoria, Tazewell and Woodford Counties</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Josh Yetter<br>720 W. Joan Court<br>Peoria, IL 61614-5976<br>County: Peoria<br>Email: <a href="mailto:jyetter@centerforpreventionofabuse.org">jyetter@centerforpreventionofabuse.org</a></td>
        </tr>
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://www.metrofamily.org/" target="_blank" rel="noopener noreferrer">Metropolitan Family Services</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>Chicago neighborhoods of Roseland, Pullman, and West Pullman</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Jennifer McCraw<br>101 N. Wacker Drive, 17<sup>th</sup> Floor<br>Chicago, IL 60606-7384<br>County: Cook<br>Email: <a href="mailto:mccrawj@metrofamily.org">mccrawj@metrofamily.org</a></td>
        </tr>
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://anewdv.org/" target="_blank" rel="noopener noreferrer">Anew</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>Cook and Will Counties</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Cristina Lopez<br>18139 S. Harwood Ave.<br>Homewood, Illinois 60430-2118<br>County: Cook<br>Email: <a href="mailto:cristina.l@anewdv.org">cristina.l@anewdv.org</a></td>
        </tr>
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://www.casacentral.org/" target="_blank" rel="noopener noreferrer">Casa Central Social Services Corporation</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>Cook County</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Nilsa Ramirez<br>1343 N California Ave<br>Chicago, IL 60622<br>County: Cook<br>Email: <a href="mailto:nramirez@casacentral.org">nramirez@casacentral.org</a></td>
        </tr>
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://stressandtrauma.org/" target="_blank" rel="noopener noreferrer">Stress and Trauma Treatment Center</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>Alexander, Edwards, Franklin, Gallatin, Hamilton, Hardin, Jackson, Jefferson, Johnson, Massac, Perry, Pope, Pulaski, Randolph, Richland, Saline, Union, Wabash, Washington, Wayne, Williamson, and White Counties in southern Illinois</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Matt Buckman<br>1200 Locust St<br>Eldorado, IL 62930<br>County: Saline<br>Email: <a href="mailto:dmattbuckman@stressandtrauma.org">dmattbuckman@stressandtrauma.org</a></td>
        </tr>
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://www.foreverychild.org/safe-from-the-start" target="_blank" rel="noopener noreferrer">Every Child</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>Rock Island, Henry and Mercer Counties</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Brittany Littrel<br>524 15<sup>th</sup> Street<br>Moline, IL 61265-2151<br>County: Rock Island<br>Email: <a href="mailto:brittanyl@foreverychild.org">brittanyl@foreverychild.org</a></td>
        </tr>
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://www.siumed.org/src" target="_blank" rel="noopener noreferrer">SIU School of Medicine</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>Sangamon County</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Jeanne Hansen<br>801 N Rutledge; PO Box 19616<br>Springfield, Illinois 62794-9616<br>County: Sangamon<br>Email: <a href="mailto:jhansen@siumed.edu">jhansen@siumed.edu</a></td>
        </tr>
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://www.eastsidealigned.org/" target="_blank" rel="noopener noreferrer">East Side Aligned</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>St. Clair County: City of East St. Louis, Village of Washington Park, City of Cahokia Heights, and Village of Fairmont City</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Olivia Borland<br>1468 State Street<br>East St. Louis, IL 62205-2010<br>County: St. Clair<br>Email: <a href="mailto:OBorland@eastsidealigned.org">OBorland@eastsidealigned.org</a></td>
        </tr>
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://refuge4kids.org/" target="_blank" rel="noopener noreferrer">Safe Surroundings and Refuge</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>Madison County</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Erin Bickle<br>44 E. Ferguson Ave.<br>Wood River, IL 62095-2024<br>County: Madison<br>Email: <a href="mailto:erin@refuge4kids.org">erin@refuge4kids.org</a></td>
        </tr>
        <tr role="row">
            <th scope="row" role="rowheader"><a href="https://www.cachelps.org/safe-from-the-start" target="_blank" rel="noopener noreferrer">CAC North and NW Cook County</a></th>
            <td role="cell"><span class="cell-label" aria-hidden="true">Areas Serviced</span>North and NW Cook County and surrounding areas</td>
            <td role="cell"><span class="cell-label" aria-hidden="true">Contact Information</span>SFS Coordinator: Bianca Gonzalez<br>657 E. Golf Rd., Suite 310<br>Arlington Heights, IL 60005<br>County: Cook<br>Email: <a href="mailto:bgonzalez@cachelps.org">bgonzalez@cachelps.org</a></td>
        </tr>
    </tbody>
</table>
</div>
