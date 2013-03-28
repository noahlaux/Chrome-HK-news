<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template match="/">
    <ul>
      <xsl:for-each select="rss/channel/item">
        <li>

          <xsl:if test="imageurl != ''">
            <img src="{imageurl}" />
          </xsl:if>

          <div>

            <h3>
              <a href="{link}" target="_blank"><xsl:value-of select="title" /></a>
            </h3>

            <div>
              <a href="{comments}" target="_blank">comments</a>
            </div>

          </div>

        </li>
      </xsl:for-each>
    </ul>
  </xsl:template>

</xsl:stylesheet>