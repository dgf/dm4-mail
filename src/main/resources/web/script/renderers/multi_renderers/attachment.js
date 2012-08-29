/*global jQuery, dm4c*/

(function ($, dm4c) {

  /**
   * generic topic cache that provides adding and removing of a topic
   * and that creates multi renderer compatible aggregation values
   *
   * TODO move a reusable variant into core
   *
   * @param {Object} topics
   * @return {Object}
   * @constructor
   */
  function TopicIdCache(topics) {

    return {

      getValues: function () {
        var values = []
        $.each(topics, function (id, topic) {
          values.push(dm4c.REF_PREFIX + id)
        })
        return values
      },

      push: function (topic) {
        topics[topic.id] = topic
      },

      remove: function (topic) {
        delete topics[topic.id]
      }
    }
  }

  /**
   * creates a attachment link with icon, name and size info
   * that reveals the file on click
   *
   * @param {Topic} file composite topic
   * @param {TopicIdCache} attachments
   * @return {jQuery}
   */
  function createAttachmentLink(file, attachments) {
    function click() {
      dm4c.do_reveal_related_topic(file.id)
    }

    var $icon = dm4c.render.icon_link(file, click),
      $link = dm4c.render.topic_link(file, click),
      $attachment = $('<div>').addClass('box level2').append($icon).append($link)
    return $attachment
  }

  /**
   * creates a button that deletes the parent DOM element and
   * removes the file topic on click
   *
   * @param {Topic} file
   * @param {TopicIdCache} attachments
   * @return {jQuery}
   */
  function createRemoveButton(file, attachments) {
    function remove() {
      var $parent = $(this).parent()
      attachments.remove(file)
      $parent.parent().remove()
    }

    var $remove = dm4c.ui.button(remove, undefined, 'circle-minus')
    return $('<div>').addClass('remove-button').append($remove)
  }

  /**
   * creates a button that opens the upload dialog on click and
   * appends the chosen file as attachment
   *
   * @param {TopicIdCache} attachments
   * @param {jQuery} $attachments
   * @return {jQuery}
   */
  function createAddButton(attachments, $attachments) {
    function add() {
      dm4c.get_plugin('de.deepamehta.files').open_upload_dialog('attachments', function (file) {
        var attachment = dm4c.restc.get_topic_by_id(file.topic_id),
          $attachment = createAttachmentLink(attachment, attachments)
        $attachment.append(createRemoveButton(attachment, attachments))
        $attachments.append($attachment)
        attachments.push(attachment)
      })
    }

    return dm4c.ui.button(add, 'Add Attachments')//.css('display', 'inline-block')
  }

  dm4c.add_multi_renderer('dm4.mail.attachment.renderer', {

    render_info: function (pages, $parent, level) {
      dm4c.render.field_label('Attachments', $parent)
      $.each(pages, function (p, page) {
        if (page.topic.id !== -1) {
          $parent.append(createAttachmentLink(page.topic))
        }
      })
    },

    render_form: function (pages, $parent, level) {

      var attachments = new TopicIdCache({}),
        $attachments = $('<div>').addClass('box level1'),
        $add = createAddButton(attachments, $attachments),
        topic_renderer = dm4c.get_page_renderer("dm4.webclient.topic_renderer")

      $.each(pages, function (p, page) {
        if (page.topic.id !== -1) {
          var attachment = page.topic,
            $attachment = createAttachmentLink(attachment, attachments)
          $attachment.append(createRemoveButton(attachment, attachments))
          attachments.push(attachment)
          $attachments.append($attachment)
        }
      })

      dm4c.render.field_label('Attachments', $parent)
      $parent.append($attachments).append($('<div>').addClass('add-button').append($add))

      return function () {
        return attachments.getValues()
      }
    }
  })
}(jQuery, dm4c))